import { useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ToolSidebar } from '../components/ToolSidebar'
import { ToolNode } from '../components/ToolNode'
import OperationControls from '../components/OperationControls'
import { useOperationStore } from '../stores/operationStore'
import { toolSchemas } from '../schemas'
import type { ToolSchema } from '../schemas/types'
import { invoke } from '@tauri-apps/api/core'

const nodeTypes = { toolNode: ToolNode }

export default function Operation() {
  const [availableTools, setAvailableTools] = useState<ToolSchema[]>([])

  const { nodes, edges, onNodesChange, onEdgesChange, addEdge, status } =
    useOperationStore()

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

  return (
    <div className="flex flex-row h-full w-full">
      {/* Left sidebar */}
      <ToolSidebar tools={availableTools} />

      {/* Right: ReactFlow canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
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
    </div>
  )
}
