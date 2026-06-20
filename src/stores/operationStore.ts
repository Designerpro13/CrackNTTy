import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from '@xyflow/react'
import type { ToolSchema } from '../schemas/types'
import { topologicalSort } from '../lib/pipeline'
import { buildCommand } from '../schemas/index'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

// ============ Types ============

export type OperationStatus = 'IDLE' | 'ARMING' | 'EXECUTING'

export type ToolNodeData = {
  toolId: string
  schema: ToolSchema
  config: Record<string, string | boolean>
  status: 'idle' | 'running' | 'completed' | 'failed'
}

// ============ Store Interface ============

interface OperationState {
  nodes: Node<ToolNodeData>[]
  edges: Edge[]
  status: OperationStatus

  // Actions
  setNodes: (nodes: Node<ToolNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: OnNodesChange<Node<ToolNodeData>>
  onEdgesChange: OnEdgesChange
  addNode: (node: Node<ToolNodeData>) => void
  removeNode: (nodeId: string) => void
  duplicateNode: (nodeId: string) => void
  addEdge: (edge: Edge) => void
  updateNodeStatus: (nodeId: string, status: ToolNodeData['status']) => void
  setOperationStatus: (status: OperationStatus) => void
  executeOperation: () => Promise<void>
}

// ============ Store Implementation ============

export const useOperationStore = create<OperationState>((set, get) => ({
  nodes: [],
  edges: [],
  status: 'IDLE',

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  addNode: (node) => {
    set((s) => ({ nodes: [...s.nodes, node] }))
  },

  removeNode: (nodeId) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }))
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId)
    if (!node) return

    const newNode: Node<ToolNodeData> = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: { ...node.data },
      selected: false,
    }

    set((s) => ({ nodes: [...s.nodes, newNode] }))
  },

  addEdge: (edge) => {
    set((s) => ({ edges: [...s.edges, edge] }))
  },

  updateNodeStatus: (nodeId, status) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, status } } : n,
      ),
    }))
  },

  setOperationStatus: (status) => set({ status }),

  executeOperation: async () => {
    const { nodes, edges } = get()

    // Set operation status to EXECUTING
    set({ status: 'EXECUTING' })

    // Run topological sort to determine execution order
    let order: string[]
    try {
      order = topologicalSort(nodes, edges)
    } catch {
      // Cycle detected — reset status and stop
      set({ status: 'IDLE' })
      return
    }

    // Iterate nodes in topological order
    for (const nodeId of order) {
      const node = get().nodes.find((n) => n.id === nodeId)
      if (!node) continue

      // Set node status to running
      get().updateNodeStatus(nodeId, 'running')

      // Build the command from the node's schema and config
      const { command, args } = buildCommand(node.data.schema, node.data.config)

      // Set up listener BEFORE invoking so we don't miss events
      const status = await new Promise<'completed' | 'failed'>((resolve) => {
        let unlisten: (() => void) | null = null

        listen<{ status: string; exit_code: number | null }>(
          `tool-status-${nodeId}`,
          (event) => {
            if (event.payload.status === 'completed' || event.payload.status === 'failed') {
              unlisten?.()
              resolve(event.payload.status as 'completed' | 'failed')
            }
          },
        ).then((unlistenFn) => {
          unlisten = unlistenFn
        })

        // Invoke the Tauri execute_tool command
        invoke('execute_tool', { id: nodeId, command, args })
      })

      if (status === 'completed') {
        get().updateNodeStatus(nodeId, 'completed')
      } else {
        // Node failed — mark it, reset operation, stop
        get().updateNodeStatus(nodeId, 'failed')
        set({ status: 'IDLE' })
        return
      }
    }

    // All nodes completed successfully
    set({ status: 'IDLE' })
  },
}))
