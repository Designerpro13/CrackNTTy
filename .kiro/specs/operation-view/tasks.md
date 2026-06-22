# Implementation Plan: Operation View

## Overview

Build the React Flow-based pipeline canvas for CrackNTTy's Operation View. Implementation proceeds bottom-up: store first, then components, then wiring them together in the view. Each task produces a working increment that can be verified in the browser.

## Tasks

- [x] 1. Create the Operation Store
  - [x] 1.1 Create `src/stores/operationStore.ts` with Zustand
    - Define `OperationStatus` type (`'IDLE' | 'ARMING' | 'EXECUTING'`)
    - Define `ToolNodeData` type (toolId, schema, config, status)
    - Implement state: `nodes`, `edges`, `status`
    - Implement actions: `addNode`, `removeNode`, `duplicateNode`, `addEdge`, `setNodes`, `setEdges`
    - Implement `onNodesChange` and `onEdgesChange` using `applyNodeChanges`/`applyEdgeChanges` from @xyflow/react
    - Implement `updateNodeStatus(nodeId, status)` to update a single node's data.status
    - Implement `setOperationStatus(status)` for global operation state
    - _Requirements: 2.2, 2.3, 3.5, 3.6, 5.2_

  - [x] 1.2 Implement `executeOperation()` in the operation store
    - Import `topologicalSort` from `src/lib/pipeline.ts`
    - Import `buildCommand` from `src/schemas/index.ts`
    - Import `invoke` from `@tauri-apps/api/core` and `listen` from `@tauri-apps/api/event`
    - Set operation status to EXECUTING
    - Run topological sort on current nodes/edges to get execution order
    - Iterate nodes in order: set node status to "running", invoke `execute_tool` with built command, listen for `tool-status-{id}` event
    - On "completed" event: update node to "completed", proceed to next
    - On "failed" event: update node to "failed", set operation status back to IDLE, stop iteration
    - On all nodes complete: set operation status to IDLE
    - Handle cycle detection error from topologicalSort gracefully
    - _Requirements: 5.2, 5.4, 5.5, 5.6_

- [x] 2. Checkpoint
  - Ensure the store compiles without type errors. Run `npm run build` to verify.

- [x] 3. Build the ToolSidebar component
  - [x] 3.1 Create `src/components/ToolSidebar.tsx`
    - Accept `tools: ToolSchema[]` prop (already filtered to active)
    - Define `categoryDisplayMap`: Reconnaissance → "Active Recon", Exploitation → "Exploit Modules", Analysis → "Credential Harvesting"
    - Group tools by category using the map
    - Render each category as a section with a heading
    - Render each tool item with: icon (emoji from schema), name, category badge
    - Set `draggable="true"` on each tool item
    - On `onDragStart`: call `event.dataTransfer.setData('application/crackntty-tool', schema.id)` and set `effectAllowed = 'move'`
    - Style: w-[250px], bg-[#131620], border-r border-slate-700, overflow-y-auto, full height
    - Tool items: hover state, cursor-grab, card-style bg-[#1a1f2e] rounded px-3 py-2
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 4. Build the ToolNode component
  - [x] 4.1 Create `src/components/ToolNode.tsx`
    - Import `Handle`, `Position`, `type NodeProps` from @xyflow/react
    - Define the component accepting `NodeProps` with `ToolNodeData` type
    - Render: tool icon, tool name, category label (using categoryDisplayMap)
    - Render status indicator dot: gray (idle), blue with pulse animation (running), green (completed), red (failed)
    - Render left Handle with `type="target"` and `position={Position.Left}`
    - Render right Handle with `type="source"` and `position={Position.Right}`
    - Add a "..." button (top-right of node card) that toggles a dropdown menu
    - Style node card: bg-[#1a1f2e], border border-slate-700, rounded-lg, min-w-[180px], shadow
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Implement context menu actions in ToolNode
    - Dropdown menu contains: Delete, Configure (placeholder for now), Duplicate
    - On "Delete": call `useOperationStore.getState().removeNode(nodeId)` — remove node and filter edges connected to it
    - On "Duplicate": call `useOperationStore.getState().duplicateNode(nodeId)` — create a copy offset by (+50, +50)
    - Close menu on click outside or after action
    - Style menu: absolute positioned, bg-[#1a1f2e], border-slate-700, rounded, shadow-lg, z-10
    - _Requirements: 3.4, 3.5, 3.6_

- [x] 5. Build the OperationControls component
  - [x] 5.1 Create `src/components/OperationControls.tsx`
    - Accept props: `status: OperationStatus`, `onExecute: () => void`, `disabled: boolean`
    - Render "Execute Operation" button: bg-red-600, hover:bg-red-700, text-white, font-semibold, px-4 py-2, rounded
    - Disable button when `disabled` is true or status is EXECUTING
    - Render status badge pill: text showing status, colored background (IDLE=slate-700, ARMING=amber-600, EXECUTING=red-600 with pulse)
    - Layout: flex row with gap between button and badge
    - _Requirements: 5.1, 5.3_

- [x] 6. Checkpoint
  - Ensure all components compile. Run `npm run build` to verify no type errors.

- [x] 7. Wire up the Operation View
  - [x] 7.1 Rewrite `src/views/Operation.tsx` with full layout
    - Import ReactFlow, Background, Controls, MiniMap from @xyflow/react
    - Import the @xyflow/react styles
    - Import ToolSidebar, ToolNode, OperationControls
    - Import useOperationStore
    - Import toolSchemas from src/schemas
    - Import `invoke` from @tauri-apps/api/core
    - Define `nodeTypes = { toolNode: ToolNode }` outside the component (stable reference)
    - On mount: check tool availability by calling `invoke('check_tool_exists', { path: schema.path })` for each schema, filter to only those that exist, store in local state
    - Render layout: flex row, full height
    - Left: `<ToolSidebar tools={availableTools} />`
    - Right: flex-1 relative container holding ReactFlow
    - ReactFlow props: `nodes`, `edges`, `onNodesChange`, `onEdgesChange` from store, `nodeTypes`, `onConnect` handler that adds edge to store
    - Inside ReactFlow: `<Background variant="dots" color="#1e293b" gap={20} />`, `<Controls />`, `<MiniMap />`
    - Overlay OperationControls absolutely in top-right of canvas container
    - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4_

  - [x] 7.2 Implement drag-and-drop handlers in Operation.tsx
    - `onDragOver`: `event.preventDefault()`, set `event.dataTransfer.dropEffect = 'move'`
    - `onDrop`: read `event.dataTransfer.getData('application/crackntty-tool')` to get toolId
    - Look up schema from toolMap using the toolId
    - Calculate drop position using `reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })`
    - Use `useReactFlow()` hook to get the instance
    - Create new node: `{ id: crypto.randomUUID(), type: 'toolNode', position, data: { toolId, schema, config: {}, status: 'idle' } }`
    - Call `addNode` from operation store
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 7.3 Implement edge animation based on operation status
    - In the Operation view, derive edges for ReactFlow by mapping store edges
    - When `status === 'EXECUTING'`, set `animated: true` on all edges
    - When status is IDLE or ARMING, set `animated: false`
    - Pass derived edges to ReactFlow component
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.4 Connect Execute button to store's executeOperation
    - Pass `onExecute={() => useOperationStore.getState().executeOperation()}` to OperationControls
    - Pass `disabled={nodes.length === 0}` to disable when canvas is empty
    - Pass current operation status for badge display
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Final checkpoint
  - Run `npm run build` to verify full compilation. Manually verify in dev mode that: sidebar shows tools, drag-drop creates nodes, nodes connect via edges, execute button triggers pipeline.

## Notes

- The "Configure" option in the node context menu is a placeholder — the Config Side Panel is a separate feature (Task 6 in IMPLEMENTATION.md)
- ARMING status is defined but not used in this implementation — reserved for future pre-execution validation
- Edge animation uses React Flow's built-in `animated` prop on edges
- Tool availability is checked once on mount; a refresh mechanism can be added later
- The existing `topologicalSort` in `src/lib/pipeline.ts` is used directly — no reimplementation needed
