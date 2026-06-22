import { invoke } from '@tauri-apps/api/core'
import type { Node, Edge, Viewport } from '@xyflow/react'
import type { ToolNodeData } from '../stores/operationStore'

// ============ Types ============

export interface WorkflowData {
  name: string
  createdAt: string
  nodes: Node<ToolNodeData>[]
  edges: Edge[]
  viewport: Viewport
}

export interface AppSettings {
  toolPaths: Record<string, string>
  wordlistDir: string
  theme: 'dark'
}

// ============ Filesystem helpers via Tauri ============

async function readTextFile(path: string): Promise<string | null> {
  try {
    return await invoke<string>('read_file', { path })
  } catch {
    return null
  }
}

async function writeTextFile(path: string, contents: string): Promise<void> {
  await invoke('write_file', { path, contents })
}

async function ensureDir(path: string): Promise<void> {
  await invoke('ensure_dir', { path })
}

// ============ Paths ============

const BASE_DIR = '~/.crackntty'
const WORKFLOWS_DIR = `${BASE_DIR}/workflows`
const SETTINGS_PATH = `${BASE_DIR}/settings.json`

// ============ Workflow Operations ============

export async function saveWorkflow(
  name: string,
  nodes: Node<ToolNodeData>[],
  edges: Edge[],
  viewport: Viewport,
): Promise<void> {
  await ensureDir(WORKFLOWS_DIR)

  const data: WorkflowData = {
    name,
    createdAt: new Date().toISOString(),
    nodes,
    edges,
    viewport,
  }

  const path = `${WORKFLOWS_DIR}/${name}.json`
  await writeTextFile(path, JSON.stringify(data, null, 2))
}

export async function loadWorkflow(name: string): Promise<WorkflowData | null> {
  const path = `${WORKFLOWS_DIR}/${name}.json`
  const content = await readTextFile(path)
  if (!content) return null

  try {
    return JSON.parse(content) as WorkflowData
  } catch {
    return null
  }
}

export async function listWorkflows(): Promise<string[]> {
  try {
    return await invoke<string[]>('list_workflows')
  } catch {
    return []
  }
}

export async function deleteWorkflow(name: string): Promise<void> {
  const path = `${WORKFLOWS_DIR}/${name}.json`
  await invoke('delete_file', { path })
}

// ============ Settings Operations ============

const defaultSettings: AppSettings = {
  toolPaths: {
    nmap: '/usr/bin/nmap',
    gobuster: '/usr/bin/gobuster',
    nikto: '/usr/bin/nikto',
    hydra: '/usr/bin/hydra',
    john: '/usr/bin/john',
    nc: '/usr/bin/nc',
    curl: '/usr/bin/curl',
  },
  wordlistDir: '~/thmtools/wordlist',
  theme: 'dark',
}

export async function loadSettings(): Promise<AppSettings> {
  const content = await readTextFile(SETTINGS_PATH)
  if (!content) return defaultSettings

  try {
    return { ...defaultSettings, ...JSON.parse(content) }
  } catch {
    return defaultSettings
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureDir(BASE_DIR)
  await writeTextFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}
