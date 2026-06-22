import { useState, useEffect, useCallback, useMemo, type DragEvent } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ToolSidebar } from '../components/ToolSidebar'
import { ToolNode } from '../components/ToolNode'
import OperationControls from '../components/OperationControls'
import ConfigPanel from '../components/ConfigPanel'
import { useOperationStore } from '../stores/operationStore'
import { toolSchemas, toolMap } from '../schemas'
import type { ToolSchema } from '../schemas/types'
import { invoke } from '@tauri-apps/api/core'

const nodeTypes = { toolNode: ToolNode }

function OperationInner() {
  const [availableTools, setAvailableTools] = useState<ToolSchema[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const { nodes, edges, onNodesChange, onEdgesChange, addEdge, addNode, status } =
    useOperationStore()

  const reactFlowInstance = useReactFlow()

  // Derive animated edges based on operation status
  const animatedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        animated: status === 'EXECUTING',
      })),
    [edges, status],
  )

  // Check tool availability on mount
  useEffect(() => {
    async function checkTools() {
      const available: ToolSchema[] = []

      await Promise.all(
        toolSchemas.map(async (schema) => {
          try {
            const exists = await invoke<boolean>('check_tool_exists', {
              path: schema.path,
            })
            if (exists) available.push(schema)
          } catch {
            // Tool not found — skip
          }
        }),
      )

      setAvailableTools(available)
    }

    checkTools()
  }, [])

  const handleConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      addEdge({
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
      })
    },
    [addEdge],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const toolId = event.dataTransfer.getData('application/crackntty-tool')
      if (!toolId) return

      const schema = toolMap[toolId]
      if (!schema) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode({
        id: crypto.randomUUID(),
        type: 'toolNode',
        position,
        data: { toolId, schema, config: {}, status: 'idle' },
      })
    },
    [reactFlowInstance, addNode],
  )

  return (
    <div className="flex flex-row h-full w-full">
      {/* Left sidebar */}
      <ToolSidebar tools={availableTools} />

      {/* Right: ReactFlow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={animatedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#1e293b"
            gap={20}
          />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {/* Operation controls overlay */}
        <div className="absolute top-4 right-4 z-10">
          <OperationControls
            status={status}
            onExecute={() =>
              useOperationStore.getState().executeOperation()
            }
            disabled={nodes.length === 0}
          />
        </div>
      </div>

      {/* Config panel */}
      {selectedNodeId && (
        <ConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  )
}

export default function Operation() {
  return (
    <ReactFlowProvider>
      <OperationInner />
    </ReactFlowProvider>
  )
}
