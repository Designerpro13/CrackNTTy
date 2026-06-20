# CrackNTTy

Visual pentest workstation — drag-and-drop security tool orchestration.

## Architecture

```
crackntty/
├── src/                    # React frontend
│   ├── views/              # 4 main views
│   │   ├── Arsenal.tsx     # Tool library with cards/filters
│   │   ├── Operation.tsx   # React Flow canvas (drag & drop)
│   │   ├── CliLogs.tsx     # Live log stream + timeline
│   │   └── Targets.tsx     # Host dashboard
│   ├── components/         # Shared UI components
│   ├── schemas/            # Tool definitions (TS)
│   ├── stores/             # Zustand state stores
│   ├── lib/                # Utilities (buildCommand, parsers, DAG)
│   ├── App.tsx             # Nav shell + view router
│   └── main.tsx            # Entry point
├── src-tauri/              # Rust backend
│   └── src/
│       ├── main.rs         # Tauri entry
│       ├── lib.rs          # Plugin registration
│       ├── commands.rs     # Tauri commands (execute, kill, check)
│       └── process.rs      # Process manager
└── docs/                   # Architecture & task docs
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + React Flow (@xyflow/react)
- **Backend**: Tauri 2 (Rust) — process spawning, stdout streaming, file system
- **State**: Zustand — variable store, log store, targets store
- **Canvas**: @xyflow/react — node editor, edges, handles, pan/zoom

## Views

| View | Description |
|------|-------------|
| **Arsenal** | Tool catalog. Cards with category filters (Recon/Exploit/Analysis), Active/Idle status, search, Configure action |
| **Operation** | Visual canvas. Drag tool blocks from sidebar, connect with edges, configure via side panel, `$variable` piping, Execute button |
| **CLI-Logs** | Live terminal. Timestamped color-coded logs, level filters (INFO/WARN/EXPLOIT), grep, active daemons, execution timeline |
| **Targets** | Host dashboard. Auto-populated from scans, port chips, status badges, detail panel with OS/services/CVEs |

## Prerequisites (system packages)

Tauri requires GTK/WebKit dev libs. Run once:

```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Running

```bash
# Dev mode (frontend only — no Tauri window, just browser)
npm run dev

# Dev mode (full Tauri desktop app)
npm run tauri dev

# Build production binary
npm run tauri build
```

## MVP Tools

| Tool | Category | Parser | Path |
|------|----------|--------|------|
| nmap | Reconnaissance | XML | /usr/bin/nmap |
| gobuster | Reconnaissance | JSON | /usr/bin/gobuster |
| nikto | Reconnaissance | Regex | /usr/bin/nikto |
| hydra | Exploitation | Regex | /usr/bin/hydra |
| john | Exploitation | Regex | /usr/sbin/john |
| netcat | Exploitation | Raw | /usr/bin/netcat |
| curl | Analysis | Raw | /usr/bin/curl |
