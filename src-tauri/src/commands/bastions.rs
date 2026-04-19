use serde::{Deserialize, Serialize};
use std::fs;
use tauri::AppHandle;

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Target {
    pub id: String,
    pub bastion_id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub target_type: String,
    pub remote_host: String,
    pub remote_port: u16,
    pub local_port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bastion {
    pub id: String,
    pub name: String,
    pub host: String,
    pub user: String,
    pub ssh_port: u16,
    pub key_path: String,
    pub status: String,
    pub targets: Vec<Target>,
    pub last_checked: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct Store {
    bastions: Vec<Bastion>,
}

fn config_path(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .app_config_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
        .join("bastions.json")
}

fn load_store(app: &AppHandle) -> Store {
    let path = config_path(app);
    if let Ok(data) = fs::read_to_string(&path) {
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Store::default()
    }
}

fn save_store(app: &AppHandle, store: &Store) -> Result<(), String> {
    let path = config_path(app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string_pretty(store).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}

// ── Commands ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_bastions(app: AppHandle) -> Vec<Bastion> {
    load_store(&app).bastions
}

#[tauri::command]
pub fn save_bastion(app: AppHandle, bastion: Bastion) -> Result<Bastion, String> {
    let mut store = load_store(&app);
    if let Some(existing) = store.bastions.iter_mut().find(|b| b.id == bastion.id) {
        *existing = bastion.clone();
    } else {
        store.bastions.push(bastion.clone());
    }
    save_store(&app, &store)?;
    Ok(bastion)
}

#[tauri::command]
pub fn delete_bastion(app: AppHandle, id: String) -> Result<(), String> {
    let mut store = load_store(&app);
    store.bastions.retain(|b| b.id != id);
    save_store(&app, &store)
}

#[tauri::command]
pub fn save_target(app: AppHandle, target: Target) -> Result<Target, String> {
    let mut store = load_store(&app);
    if let Some(bastion) = store.bastions.iter_mut().find(|b| b.id == target.bastion_id) {
        if let Some(existing) = bastion.targets.iter_mut().find(|t| t.id == target.id) {
            *existing = target.clone();
        } else {
            bastion.targets.push(target.clone());
        }
    }
    save_store(&app, &store)?;
    Ok(target)
}

#[tauri::command]
pub fn delete_target(app: AppHandle, id: String) -> Result<(), String> {
    let mut store = load_store(&app);
    for bastion in &mut store.bastions {
        bastion.targets.retain(|t| t.id != id);
    }
    save_store(&app, &store)
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    #[test]
    fn default_store_is_empty() {
        let store = super::Store::default();
        assert!(store.bastions.is_empty());
    }

    #[test]
    fn bastion_serializes_round_trip() {
        let b = super::Bastion {
            id: "b-1".into(),
            name: "prod".into(),
            host: "bastion.corp.com".into(),
            user: "ubuntu".into(),
            ssh_port: 22,
            key_path: "~/.ssh/id_rsa".into(),
            status: "unknown".into(),
            targets: vec![],
            last_checked: None,
        };
        let json = serde_json::to_string(&b).unwrap();
        let back: super::Bastion = serde_json::from_str(&json).unwrap();
        assert_eq!(back.id, b.id);
        assert_eq!(back.host, b.host);
    }

    #[test]
    fn target_serializes_round_trip() {
        let t = super::Target {
            id: "t-1".into(),
            bastion_id: "b-1".into(),
            name: "prod-postgres".into(),
            target_type: "postgres".into(),
            remote_host: "db.internal".into(),
            remote_port: 5432,
            local_port: 5434,
        };
        let json = serde_json::to_string(&t).unwrap();
        let back: super::Target = serde_json::from_str(&json).unwrap();
        assert_eq!(back.remote_port, 5432);
        assert_eq!(back.local_port, 5434);
    }
}
