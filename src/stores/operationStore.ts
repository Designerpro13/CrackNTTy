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
}))
