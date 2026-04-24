// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{bastions, tunnels, probe, settings};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // Bastions
            bastions::list_bastions,
            bastions::save_bastion,
            bastions::delete_bastion,
            bastions::save_target,
            bastions::delete_target,
            // Tunnels
            tunnels::list_tunnels,
            tunnels::open_tunnel,
            tunnels::close_tunnel,
            tunnels::extend_tunnel,
            // Probe
            probe::test_bastion,
            probe::probe_target,
            // Settings
            settings::get_settings,
            settings::save_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Bastion Orbit");
}
