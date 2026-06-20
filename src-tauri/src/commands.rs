use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

pub struct ProcessManager {
    pub processes: Mutex<HashMap<String, Child>>,
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }
}

#[derive(Clone, serde::Serialize)]
struct OutputEvent {
    line: String,
    stream: String, // "stdout" or "stderr"
    timestamp: String,
}

#[derive(Clone, serde::Serialize)]
struct StatusEvent {
    status: String, // "running", "completed", "failed", "killed"
    exit_code: Option<i32>,
}

#[tauri::command]
pub async fn execute_tool(
    app: AppHandle,
    id: String,
    command: String,
    args: Vec<String>,
) -> Result<(), String> {
    let output_event_name = format!("tool-output-{}", id);
    let status_event_name = format!("tool-status-{}", id);

    // Emit running status
    let _ = app.emit(
        &status_event_name,
        StatusEvent {
            status: "running".into(),
            exit_code: None,
        },
    );

    std::thread::spawn(move || {
        let result = Command::new(&command)
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn();

        match result {
            Ok(mut child) => {
                // Read stdout
                if let Some(stdout) = child.stdout.take() {
                    let reader = BufReader::new(stdout);
                    let app_clone = app.clone();
                    let event_name = output_event_name.clone();
                    std::thread::spawn(move || {
                        for line in reader.lines() {
                            if let Ok(line) = line {
                                let _ = app_clone.emit(
                                    &event_name,
                                    OutputEvent {
                                        line,
                                        stream: "stdout".into(),
                                        timestamp: chrono::Local::now()
                                            .format("%H:%M:%S")
                                            .to_string(),
                                    },
                                );
                            }
                        }
                    });
                }

                // Read stderr
                if let Some(stderr) = child.stderr.take() {
                    let reader = BufReader::new(stderr);
                    let app_clone = app.clone();
                    let event_name = output_event_name.clone();
                    std::thread::spawn(move || {
                        for line in reader.lines() {
                            if let Ok(line) = line {
                                let _ = app_clone.emit(
                                    &event_name,
                                    OutputEvent {
                                        line,
                                        stream: "stderr".into(),
                                        timestamp: chrono::Local::now()
                                            .format("%H:%M:%S")
                                            .to_string(),
                                    },
                                );
                            }
                        }
                    });
                }

                // Wait for process to finish
                match child.wait() {
                    Ok(status) => {
                        let _ = app.emit(
                            &status_event_name,
                            StatusEvent {
                                status: if status.success() {
                                    "completed"
                                } else {
                                    "failed"
                                }
                                .into(),
                                exit_code: status.code(),
                            },
                        );
                    }
                    Err(e) => {
                        let _ = app.emit(
                            &status_event_name,
                            StatusEvent {
                                status: "failed".into(),
                                exit_code: None,
                            },
                        );
                        let _ = app.emit(
                            &output_event_name,
                            OutputEvent {
                                line: format!("Process error: {}", e),
                                stream: "stderr".into(),
                                timestamp: chrono::Local::now()
                                    .format("%H:%M:%S")
                                    .to_string(),
                            },
                        );
                    }
                }
            }
            Err(e) => {
                let _ = app.emit(
                    &status_event_name,
                    StatusEvent {
                        status: "failed".into(),
                        exit_code: None,
                    },
                );
                let _ = app.emit(
                    &output_event_name,
                    OutputEvent {
                        line: format!("Failed to spawn: {}", e),
                        stream: "stderr".into(),
                        timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
                    },
                );
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn kill_tool(
    id: String,
    state: State<'_, ProcessManager>,
) -> Result<(), String> {
    let mut procs = state.processes.lock().map_err(|e| e.to_string())?;
    if let Some(child) = procs.get_mut(&id) {
        child.kill().map_err(|e| e.to_string())?;
        procs.remove(&id);
        Ok(())
    } else {
        Err(format!("No process with id: {}", id))
    }
}

#[tauri::command]
pub async fn check_tool_exists(path: String) -> bool {
    std::path::Path::new(&path).exists()
}
