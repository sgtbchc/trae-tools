use serde::Serialize;
use tauri::Manager;

#[derive(Debug, Serialize, Clone)]
struct MonitorInfo {
    id: String,
    name: String,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    scale_factor: f64,
    is_primary: bool,
}

#[tauri::command]
fn get_monitors(app: tauri::AppHandle) -> Vec<MonitorInfo> {
    let available = app.available_monitors();
    let primary = app.primary_monitor().ok().flatten();

    available
        .iter()
        .map(|m| {
            let rect = m.position();
            let size = m.size();
            let primary_id = primary.as_ref().map(|p| p.name()).flatten();

            MonitorInfo {
                id: m.name().unwrap_or_default().to_string(),
                name: m.name().unwrap_or_default().to_string(),
                x: rect.x,
                y: rect.y,
                width: size.width as i32,
                height: size.height as i32,
                scale_factor: m.scale_factor(),
                is_primary: primary_id.map_or(false, |pid| pid == m.name().unwrap_or_default()),
            }
        })
        .collect()
}

#[tauri::command]
fn position_island(app: tauri::AppHandle, monitor_id: String, island_width: i32, island_height: i32) -> Result<(), String> {
    let win = app.get_webview_window("dynamic-island").ok_or("Window not found")?;

    let monitor = app
        .available_monitors()
        .iter()
        .find(|m| m.name().unwrap_or_default() == monitor_id)
        .ok_or("Monitor not found")?;

    let pos = monitor.position();
    let size = monitor.size();
    let scale = monitor.scale_factor();

    let x = pos.x + ((size.width as f64 / scale) as i32 - island_width) / 2;
    let y = pos.y + 4;

    win.set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(x, y)))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_monitors, position_island])
        .setup(|app| {
            let win = app.get_webview_window("dynamic-island").unwrap();

            #[cfg(target_os = "windows")]
            {
                use tauri::webview::Color;
                let _ = win.set_background_color(Some(Color(0, 0, 0, 0)));
            }

            let _ = win.set_ignore_cursor_events(true);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
