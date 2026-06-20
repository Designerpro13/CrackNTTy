mod commands;

use commands::{check_tool_exists, execute_tool, kill_tool};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_tool,
            kill_tool,
            check_tool_exists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
