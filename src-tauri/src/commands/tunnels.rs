use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::State;

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TunnelRecord {
    pub id: String,
    pub bastion_id: String,
    pub target_id: String,
    pub bastion_name: String,
    pub target_name: String,
    pub target_type: String,
    pub remote_host: String,
    pub remote_port: u16,
    pub local_port: u16,
    pub started_at: String,
    pub expires_at: String,
    pub status: String,
    pub pid: Option<u32>,
}

/// In-memory store of live SSH child processes
pub struct TunnelStore {
    pub records: Mutex<Vec<TunnelRecord>>,
    pub processes: Mutex<HashMap<String, Child>>,
}

impl TunnelStore {
    pub fn new() -> Self {
        Self {
            records: Mutex::new(vec![]),
            processes: Mutex::new(HashMap::new()),
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn expand_tilde(path: &str) -> String {
    if path.starts_with('~') {
        if let Some(home) = std::env::var_os("HOME") {
            return format!("{}{}", home.to_string_lossy(), &path[1..]);
        }
    }
    path.to_owned()
}

fn iso_now() -> String {
    // Simple ISO timestamp without chrono dependency
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("{}", secs) // Real impl: format as ISO 8601
}

fn iso_future(seconds: u64) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() + seconds;
    format!("{}", secs)
}

// ── Commands ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_tunnels(store: State<TunnelStore>) -> Vec<TunnelRecord> {
    store.records.lock().unwrap().clone()
}

#[derive(Deserialize)]
pub struct OpenTunnelArgs {
    pub bastion_id: String,
    pub target_id: String,
    pub ttl_minutes: u32,
    // Denormalized info passed from frontend
    pub bastion_name: String,
    pub bastion_host: String,
    pub bastion_user: String,
    pub bastion_ssh_port: u16,
    pub bastion_key_path: String,
    pub target_name: String,
    pub target_type: String,
    pub remote_host: String,
    pub remote_port: u16,
    pub local_port: u16,
}

#[tauri::command]
pub fn open_tunnel(
    store: State<TunnelStore>,
    args: OpenTunnelArgs,
) -> Result<TunnelRecord, String> {
    let key_path = expand_tilde(&args.bastion_key_path);

    // Build: ssh -N -L localPort:remoteHost:remotePort user@host -p port -i key ...
    let forward = format!("{}:{}:{}", args.local_port, args.remote_host, args.remote_port);
    let destination = format!("{}@{}", args.bastion_user, args.bastion_host);

    let mut cmd = Command::new("ssh");
    cmd.args([
        "-N",
        "-L", &forward,
        &destination,
        "-p", &args.bastion_ssh_port.to_string(),
        "-i", &key_path,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "-o", "StrictHostKeyChecking=no",
        "-o", "ExitOnForwardFailure=yes",
    ]);

    let child = cmd.spawn().map_err(|e| format!("Failed to spawn SSH: {e}"))?;
    let pid = child.id();

    let id = format!("tun-{}", pid);
    let record = TunnelRecord {
        id: id.clone(),
        bastion_id: args.bastion_id,
        target_id: args.target_id,
        bastion_name: args.bastion_name,
        target_name: args.target_name,
        target_type: args.target_type,
        remote_host: args.remote_host,
        remote_port: args.remote_port,
        local_port: args.local_port,
        started_at: iso_now(),
        expires_at: iso_future((args.ttl_minutes as u64) * 60),
        status: "active".into(),
        pid: Some(pid),
    };

    store.records.lock().unwrap().push(record.clone());
    store.processes.lock().unwrap().insert(id, child);

    Ok(record)
}

#[tauri::command]
pub fn close_tunnel(store: State<TunnelStore>, tunnel_id: String) -> Result<(), String> {
    if let Some(mut child) = store.processes.lock().unwrap().remove(&tunnel_id) {
        child.kill().map_err(|e| e.to_string())?;
    }
    let mut records = store.records.lock().unwrap();
    if let Some(r) = records.iter_mut().find(|r| r.id == tunnel_id) {
        r.status = "stopped".into();
    }
    Ok(())
}

#[tauri::command]
pub fn extend_tunnel(
    store: State<TunnelStore>,
    tunnel_id: String,
    extra_minutes: u32,
) -> Result<TunnelRecord, String> {
    let mut records = store.records.lock().unwrap();
    let record = records
        .iter_mut()
        .find(|r| r.id == tunnel_id)
        .ok_or_else(|| "Tunnel not found".to_string())?;

    // Parse current expiry (stored as Unix seconds in this simplified impl)
    let current_expiry: u64 = record.expires_at.parse().unwrap_or(0);
    let new_expiry = current_expiry + (extra_minutes as u64) * 60;
    record.expires_at = new_expiry.to_string();

    Ok(record.clone())
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expand_tilde_replaces_home() {
        std::env::set_var("HOME", "/home/testuser");
        let result = expand_tilde("~/.ssh/id_rsa");
        assert_eq!(result, "/home/testuser/.ssh/id_rsa");
    }

    #[test]
    fn expand_tilde_no_tilde_unchanged() {
        let result = expand_tilde("/absolute/path/key");
        assert_eq!(result, "/absolute/path/key");
    }

    #[test]
    fn tunnel_store_starts_empty() {
        let store = TunnelStore::new();
        assert!(store.records.lock().unwrap().is_empty());
        assert!(store.processes.lock().unwrap().is_empty());
    }

    #[test]
    fn tunnel_record_serializes() {
        let r = TunnelRecord {
            id: "tun-1".into(),
            bastion_id: "b-1".into(),
            target_id: "t-1".into(),
            bastion_name: "prod-bastion".into(),
            target_name: "prod-postgres".into(),
            target_type: "postgres".into(),
            remote_host: "db.internal".into(),
            remote_port: 5432,
            local_port: 5434,
            started_at: "1700000000".into(),
            expires_at: "1700003600".into(),
            status: "active".into(),
            pid: Some(12345),
        };
        let json = serde_json::to_string(&r).unwrap();
        let back: TunnelRecord = serde_json::from_str(&json).unwrap();
        assert_eq!(back.local_port, 5434);
        assert_eq!(back.status, "active");
    }

    #[test]
    fn iso_future_is_after_now() {
        let now_approx: u64 = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let future: u64 = iso_future(3600).parse().unwrap();
        assert!(future > now_approx);
        assert!(future <= now_approx + 3700); // within 100s margin
    }
}
