# CrackNTTy — Implementation Spec

## Environment Notes

- **Node**: v21.7.3 — Vite 5 is used (Vite 7 requires Node ≥22.12)
- **Cargo**: 1.96.0
- **Missing system dep**: `sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev` needed for Rust/Tauri compilation
- **Tailwind**: v4 with `@tailwindcss/postcss` plugin (uses `@import "tailwindcss"` syntax, no config file needed)

## Status: Scaffolding Complete

What's done:

- [x] Tauri + React + TypeScript + Tailwind project initialized
- [x] 4-view navigation shell (Arsenal, Operation, CLI-Logs, Targets)
- [x] Tool schemas for all 7 MVP tools (nmap, gobuster, nikto, hydra, john, netcat, curl)
- [x] `buildCommand()` utility to generate CLI commands from schema + values
- [x] Zustand stores: VariableStore, LogStore, ProcessStore, TargetStore
- [x] Rust backend: `execute_tool`, `kill_tool`, `check_tool_exists` commands
- [x] Output parsers for all tools (nmap XML, gobuster regex, hydra regex, etc.)
- [x] Pipeline DAG utilities (topological sort, variable resolution)

What's next (implementation in Kiro IDE):

- [ ] Task 3: Arsenal View UI
- [ ] Task 5: Operation View (React Flow canvas)
- [ ] Task 6: Config Side Panel
- [ ] Task 7: Pipeline Execution wiring
- [ ] Task 9: CLI-Logs View
- [ ] Task 10: Targets View
- [ ] Task 11: Persistence
- [ ] Task 12: Polish

---

## Task 3: Arsenal View

**File:** `src/views/Arsenal.tsx`

**Requirements:**

- Import `toolSchemas` from `../schemas`
- Display tool cards in a responsive grid (4 cols on large screens)
- Each card: icon (top-left), category tag (top-right), name, description, status (Active ●/Idle ○), "Configure →"
- Category filter pills: All Tools | Reconnaissance | Exploitation | Analysis
- Search bar filters by name/description
- Call `invoke('check_tool_exists', { path })` on mount to determine Active/Idle per tool
- Styling: dark theme, cards with subtle border, hover elevation

**Reference mockup:** Tool cards with rounded corners, monospace category badges, green dot = Active, gray dot = Idle

---

## Task 5: Operation View

**File:** `src/views/Operation.tsx`

**Requirements:**

- Left sidebar (~250px): categorized tool list (draggable items)
  - Categories: "Active Recon", "Exploit Modules", "Credential Harvesting"
  - Only tools with `status: 'active'` shown
- Center: React Flow canvas
  - `onDragOver` + `onDrop` to create nodes from sidebar items
  - Custom node component (`src/components/ToolNode.tsx`):
    - Icon, tool name, category label
    - Status indicator (idle/running/completed/failed)
    - Input handle (left, type "target") + Output handle (right, type "source")
    - "..." menu (delete, configure, duplicate)
  - Edges: animated when pipeline is running
- Top right: "Execute Operation" button (red, matching mockup)
- Top right: Status badge ("ARMING" / "IDLE" / "EXECUTING")
- Canvas controls: MiniMap, zoom buttons, pan tool

**Key imports:**

```tsx
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
```

**Node data structure:**

```ts
type ToolNodeData = {
  toolId: string
  schema: ToolSchema
  config: Record<string, string | boolean>  // filled form values
  status: 'idle' | 'running' | 'completed' | 'failed'
}
```

---

## Task 6: Config Side Panel

**File:** `src/components/ConfigPanel.tsx`

**Requirements:**

- Renders when a node is selected (use React Flow's `onNodeClick`)
- Right-side panel (~350px), slides in with transition
- Header: tool icon + name + "×" close button
- Dynamic form from `schema.args`:
  - `text` → input with placeholder
  - `number` → number input
  - `select` → dropdown
  - `file` → input with browse button (use Tauri's `dialog.open()`)
  - `boolean` → toggle switch
  - `multiselect` → chip/tag selector
- **Variable autocomplete:**
  - When user types `$` in any text field, show dropdown
  - Dropdown lists available variables from `useVariableStore`
  - Format: `$toolId.field` — e.g., `$nmap.open_ports.ssh`
  - Selected variable shown as colored chip (pink/red background, matching mockup)
- Flag chips: for scan types, show as clickable chips (-sS, -sT, -sV, etc.)
- Save values to node data: `setNodes(nds => nds.map(n => n.id === selectedId ? {...n, data: {...n.data, config: values}} : n))`

---

## Task 7: Pipeline Execution

**File:** `src/lib/executePipeline.ts`

**Flow:**

1. Get all nodes + edges from React Flow
2. Call `topologicalSort(nodes, edges)` → execution order
3. For each node in order:
   a. Resolve `$variable` references in config values using `useVariableStore.resolve()`
   b. Call `buildCommand(schema, resolvedConfig)` → `{ command, args }`
   c. Call `invoke('execute_tool', { id: nodeId, command, args })`
   d. Listen to `tool-output-{id}` events → accumulate output
   e. Listen to `tool-status-{id}` events → update node status
   f. On completion: parse output with `getParser(toolId)(rawOutput)` → store in VariableStore
   g. On failure: mark node failed, optionally halt pipeline
4. Update global status: IDLE → ARMING → EXECUTING → IDLE

**Tauri event listening:**

```ts
import { listen } from '@tauri-apps/api/event'

const unlisten = await listen<OutputEvent>(`tool-output-${id}`, (event) => {
  // append to output buffer
})
```

---

## Task 9: CLI-Logs View

**File:** `src/views/CliLogs.tsx`

**Layout (3-column):**

- Left sidebar (~220px):
  - Stream Filters: checkboxes for INFO ☑️ (count), WARN ☑️ (count), EXPLOIT ☑️ (count)
  - Grep input: `<input placeholder="Grep pattern...">`
  - Active Daemons: list from `useProcessStore` (processes with status 'running')
    - Each: blue/green/red dot + name + PID + short status text
- Center (flex-1):
  - Terminal-style log display (monospace font, dark bg)
  - Each line: `HH:MM:SS  [LEVEL]  message`
  - Color coding: INFO=slate, WARN=yellow, EXPLOIT=red
  - Auto-scroll to bottom (with manual scroll lock)
  - Bottom: optional command input bar
- Right sidebar (~250px):
  - Execution Timeline: vertical stepper
  - Each phase: circle indicator (✓ done / ● active / ○ pending) + name + timestamp + summary

**Data source:** `useLogStore` — all tool output events feed into this via the pipeline executor

---

## Task 10: Targets View

**File:** `src/views/Targets.tsx`

**Layout:**

- Header: "Active Engagements" + subtitle "Monitoring X nodes across Y subnets"
- Top bar: Filter button + "+ Add Target" button
- Main: responsive card grid
  - Each card: IP (large), hostname/name, status badge (Vulnerable=orange, Scanned=green, Monitored=blue), port chips
  - Port chips: normal ports = gray pills, risky ports (3389, 445, 21, 23) = red pills
- Right panel (on card click): detail view
  - IP + name header
  - OS + Last Seen badges
  - Service Topology: list of port/protocol/service rows with icons
  - Known Issues: CVE IDs with warning icon
  - "Analyze" button on risky services

**Auto-population:** When nmap parser produces hosts, call `useTargetStore.addTarget()` with parsed data

---

## Task 11: Persistence

**Files:** `src/lib/persistence.ts` + Tauri filesystem commands

**Workflow save format (`~/.crackntt/workflows/{name}.json`):**

```json
{
  "name": "web_recon",
  "createdAt": "...",
  "nodes": [...],    // React Flow nodes with data.config
  "edges": [...],    // React Flow edges
  "viewport": {...}  // zoom/pan state
}
```

**Settings (`~/.crackntt/settings.json`):**

```json
{
  "toolPaths": { "nmap": "/usr/bin/nmap", ... },
  "wordlistDir": "~/thmtools/wordlist",
  "theme": "dark"
}
```

Use Tauri's `fs` plugin or `invoke` commands to read/write these files.

---

## Design System (from mockups)

**Colors:**

- Background: `#0f1117` (main), `#131620` (nav/sidebars)
- Cards: `#1a1f2e` with `border-slate-700`
- Text: `#e2e8f0` (primary), `#94a3b8` (secondary)
- Accent: `#3b82f6` (blue), `#ef4444` (red/danger), `#10b981` (green/success)
- Status badges: orange=Vulnerable, green=Scanned, blue=Monitored

**Typography:**

- UI: Inter/system sans-serif
- Terminal/code: JetBrains Mono / monospace
- Headings: font-bold, tracking-tight

**Components:**

- Cards: rounded-lg, subtle border, hover:shadow-lg transition
- Buttons: rounded-md, font-medium, px-4 py-2
- Inputs: bg-slate-800, border-slate-700, focus:border-blue-500
- Pills/chips: rounded-full, text-xs, px-2 py-0.5
- Status dots: w-2 h-2 rounded-full inline-block

---

## Key File Map

```
src/
├── App.tsx                      # Nav shell (DONE)
├── main.tsx                     # Entry (DONE)
├── index.css                    # Tailwind import (DONE)
├── views/
│   ├── Arsenal.tsx              # TODO: Task 3
│   ├── Operation.tsx            # TODO: Task 5
│   ├── CliLogs.tsx              # TODO: Task 9
│   └── Targets.tsx              # TODO: Task 10
├── components/
│   ├── ToolNode.tsx             # TODO: Custom React Flow node
│   ├── ConfigPanel.tsx          # TODO: Task 6
│   ├── ToolCard.tsx             # TODO: Arsenal card component
│   └── VariableInput.tsx        # TODO: Input with $var autocomplete
├── schemas/
│   ├── types.ts                 # (DONE) ToolSchema, ArgDef interfaces
│   ├── index.ts                 # (DONE) Schema registry + buildCommand
│   ├── nmap.ts                  # (DONE)
│   ├── gobuster.ts              # (DONE)
│   ├── nikto.ts                 # (DONE)
│   ├── hydra.ts                 # (DONE)
│   ├── john.ts                  # (DONE)
│   ├── netcat.ts                # (DONE)
│   └── curl.ts                  # (DONE)
├── stores/
│   └── index.ts                 # (DONE) Variable, Log, Process, Target stores
├── lib/
│   ├── pipeline.ts              # (DONE) DAG sort + variable resolution
│   ├── parsers.ts               # (DONE) All tool output parsers
│   └── persistence.ts           # TODO: Save/load workflows
src-tauri/src/
├── main.rs                      # Tauri entry (DONE)
├── lib.rs                       # Command registration (DONE)
└── commands.rs                  # (DONE) execute_tool, kill_tool, check_tool_exists
```
