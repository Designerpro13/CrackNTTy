import { create } from 'zustand'

// ============ Variable Store ============
// Holds parsed outputs from tool executions, accessible via $tool.path notation

interface VariableStoreState {
  variables: Record<string, Record<string, unknown>> // { nmap: { hosts: [...], open_ports: {...} } }
  setToolOutput: (toolId: string, data: Record<string, unknown>) => void
  resolve: (ref: string) => unknown // resolve "$nmap.open_ports.ssh" 
  clear: () => void
}

export const useVariableStore = create<VariableStoreState>((set, get) => ({
  variables: {},
  setToolOutput: (toolId, data) =>
    set((s) => ({ variables: { ...s.variables, [toolId]: data } })),
  resolve: (ref) => {
    const stripped = ref.startsWith('$') ? ref.slice(1) : ref
    const parts = stripped.split('.')
    const toolId = parts[0]
    const data = get().variables[toolId]
    if (!data) return undefined
    let current: unknown = data
    for (let i = 1; i < parts.length; i++) {
      if (current == null || typeof current !== 'object') return undefined
      current = (current as Record<string, unknown>)[parts[i]]
    }
    return current
  },
  clear: () => set({ variables: {} }),
}))

// ============ Log Store ============
// Central log stream for CLI-Logs view

export type LogLevel = 'INFO' | 'WARN' | 'EXPLOIT'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string       // tool ID or "system"
  message: string
}

interface LogStoreState {
  logs: LogEntry[]
  addLog: (entry: Omit<LogEntry, 'id'>) => void
  clear: () => void
}

export const useLogStore = create<LogStoreState>((set) => ({
  logs: [],
  addLog: (entry) =>
    set((s) => ({
      logs: [...s.logs, { ...entry, id: `${Date.now()}-${Math.random()}` }],
    })),
  clear: () => set({ logs: [] }),
}))

// ============ Process Store ============
// Tracks active/completed processes

export type ProcessStatus = 'running' | 'completed' | 'failed' | 'killed'

export interface ProcessInfo {
  id: string
  toolId: string
  toolName: string
  status: ProcessStatus
  startedAt: string
  output: string[]
}

interface ProcessStoreState {
  processes: Record<string, ProcessInfo>
  setProcess: (id: string, info: ProcessInfo) => void
  updateStatus: (id: string, status: ProcessStatus) => void
  appendOutput: (id: string, line: string) => void
  clear: () => void
}

export const useProcessStore = create<ProcessStoreState>((set) => ({
  processes: {},
  setProcess: (id, info) =>
    set((s) => ({ processes: { ...s.processes, [id]: info } })),
  updateStatus: (id, status) =>
    set((s) => ({
      processes: {
        ...s.processes,
        [id]: s.processes[id] ? { ...s.processes[id], status } : s.processes[id],
      },
    })),
  appendOutput: (id, line) =>
    set((s) => ({
      processes: {
        ...s.processes,
        [id]: s.processes[id]
          ? { ...s.processes[id], output: [...s.processes[id].output, line] }
          : s.processes[id],
      },
    })),
  clear: () => set({ processes: {} }),
}))

// ============ Targets Store ============
// Discovered/manually added hosts

export interface TargetPort {
  port: number
  protocol: string
  service: string
  state: string
}

export interface Target {
  id: string
  ip: string
  hostname?: string
  name?: string
  os?: string
  status: 'scanned' | 'vulnerable' | 'monitored'
  ports: TargetPort[]
  lastSeen: string
  cves?: string[]
}

interface TargetStoreState {
  targets: Target[]
  addTarget: (target: Target) => void
  updateTarget: (id: string, updates: Partial<Target>) => void
  removeTarget: (id: string) => void
  clear: () => void
}

export const useTargetStore = create<TargetStoreState>((set) => ({
  targets: [],
  addTarget: (target) => set((s) => ({ targets: [...s.targets, target] })),
  updateTarget: (id, updates) =>
    set((s) => ({
      targets: s.targets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTarget: (id) =>
    set((s) => ({ targets: s.targets.filter((t) => t.id !== id) })),
  clear: () => set({ targets: [] }),
}))
