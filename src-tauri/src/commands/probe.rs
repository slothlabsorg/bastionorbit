use serde::Serialize;
use std::process::Command;
use std::time::Instant;

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct TestResult {
    pub ok: bool,
    pub latency_ms: Option<u64>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProbeResult {
    pub reachable: bool,
    pub error: Option<String>,
}

// ── Commands ──────────────────────────────────────────────────────────────────

/// Test SSH connectivity to a bastion. Runs: ssh -o ConnectTimeout=5 user@host -i key exit
#[tauri::command]
pub fn test_bastion(
    host: String,
    user: String,
    ssh_port: u16,
    key_path: String,
) -> TestResult {
    let expanded_key = expand_tilde(&key_path);
    let destination = format!("{}@{}", user, host);
    let start = Instant::now();

    let result = Command::new("ssh")
        .args([
            "-o", "ConnectTimeout=5",
            "-o", "BatchMode=yes",
            "-o", "StrictHostKeyChecking=no",
            "-p", &ssh_port.to_string(),
            "-i", &expanded_key,
            &destination,
            "exit",
        ])
        .output();

    let latency_ms = start.elapsed().as_millis() as u64;

    match result {
        Ok(output) if output.status.success() => TestResult {
            ok: true,
            latency_ms: Some(latency_ms),
            error: None,
        },
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            TestResult {
                ok: false,
                latency_ms: None,
                error: Some(stderr),
            }
        }
        Err(e) => TestResult {
            ok: false,
            latency_ms: None,
            error: Some(e.to_string()),
        },
    }
}

/// Check if a remote port is reachable through the bastion (using nc -z).
#[tauri::command]
pub fn probe_target(
    bastion_host: String,
    bastion_user: String,
    bastion_ssh_port: u16,
    bastion_key_path: String,
    remote_host: String,
    remote_port: u16,
) -> ProbeResult {
    let expanded_key = expand_tilde(&bastion_key_path);
    let destination = format!("{}@{}", bastion_user, bastion_host);
    let nc_cmd = format!("nc -z -w 3 {} {}", remote_host, remote_port);

    let result = Command::new("ssh")
        .args([
            "-o", "ConnectTimeout=5",
            "-o", "BatchMode=yes",
            "-o", "StrictHostKeyChecking=no",
            "-p", &bastion_ssh_port.to_string(),
            "-i", &expanded_key,
            &destination,
            &nc_cmd,
        ])
        .output();

    match result {
        Ok(output) if output.status.success() => ProbeResult { reachable: true, error: None },
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            ProbeResult { reachable: false, error: Some(stderr) }
        }
        Err(e) => ProbeResult { reachable: false, error: Some(e.to_string()) },
    }
}

fn expand_tilde(path: &str) -> String {
    if path.starts_with('~') {
        if let Some(home) = std::env::var_os("HOME") {
            return format!("{}{}", home.to_string_lossy(), &path[1..]);
        }
    }
    path.to_owned()
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_result_ok_serializes() {
        let r = TestResult { ok: true, latency_ms: Some(42), error: None };
        let json = serde_json::to_string(&r).unwrap();
        assert!(json.contains("\"ok\":true"));
        assert!(json.contains("42"));
    }

    #[test]
    fn test_result_error_serializes() {
        let r = TestResult { ok: false, latency_ms: None, error: Some("Connection refused".into()) };
        let json = serde_json::to_string(&r).unwrap();
        assert!(json.contains("\"ok\":false"));
        assert!(json.contains("Connection refused"));
    }

    #[test]
    fn probe_result_reachable_serializes() {
        let r = ProbeResult { reachable: true, error: None };
        let json = serde_json::to_string(&r).unwrap();
        assert!(json.contains("\"reachable\":true"));
    }

    #[test]
    fn expand_tilde_with_home() {
        std::env::set_var("HOME", "/home/user");
        assert_eq!(expand_tilde("~/.ssh/key"), "/home/user/.ssh/key");
    }

    #[test]
    fn expand_tilde_absolute_unchanged() {
        assert_eq!(expand_tilde("/etc/ssh/key"), "/etc/ssh/key");
    }
}
