use serde::{Deserialize, Serialize};
use std::fs;
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub default_ttl_minutes: u32,
    pub server_alive_interval: u32,
    pub server_alive_count_max: u32,
    pub strict_host_key_checking: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            default_ttl_minutes: 30,
            server_alive_interval: 60,
            server_alive_count_max: 3,
            strict_host_key_checking: false,
        }
    }
}

fn settings_path(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .app_config_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."))
        .join("settings.json")
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> AppSettings {
    let path = settings_path(&app);
    if let Ok(data) = fs::read_to_string(&path) {
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        AppSettings::default()
    }
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = settings_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_settings_are_sane() {
        let s = AppSettings::default();
        assert_eq!(s.default_ttl_minutes, 30);
        assert_eq!(s.server_alive_interval, 60);
        assert!(!s.strict_host_key_checking);
    }

    #[test]
    fn settings_round_trip() {
        let s = AppSettings {
            default_ttl_minutes: 60,
            server_alive_interval: 30,
            server_alive_count_max: 5,
            strict_host_key_checking: true,
        };
        let json = serde_json::to_string(&s).unwrap();
        let back: AppSettings = serde_json::from_str(&json).unwrap();
        assert_eq!(back.default_ttl_minutes, 60);
        assert!(back.strict_host_key_checking);
    }
}
