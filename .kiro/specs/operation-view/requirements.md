# Requirements Document

## Introduction

The Operation View is the primary pipeline canvas in CrackNTTy where users visually construct attack chains. Users drag pentesting tools from a categorized sidebar onto a React Flow canvas, connect them into directed pipelines, and execute the entire operation. This view transforms CrackNTTy from a tool launcher into a visual orchestrator for multi-step penetration testing workflows.

## Glossary

- **Canvas**: The central React Flow workspace where tool nodes are placed and connected
- **Tool_Node**: A visual node on the canvas representing a single tool instance with its configuration and execution status
- **Pipeline**: A directed acyclic graph of connected tool nodes defining an execution sequence
- **Sidebar**: The left panel listing available tools grouped by category, from which users drag items onto the canvas
- **Operation_Status**: The global state of the pipeline canvas — one of IDLE, ARMING, or EXECUTING
- **Edge**: A directional connection between two tool nodes indicating data flow or execution order
- **Handle**: A connection point on a tool node — input (left/target) or output (right/source)

## Requirements

### Requirement 1: Tool Sidebar

**User Story:** As a pentester, I want a categorized sidebar of available tools, so that I can quickly find and drag the right tool onto my operation canvas.

#### Acceptance Criteria

1. THE Sidebar SHALL display tools grouped under the categories "Active Recon", "Exploit Modules", and "Credential Harvesting"
2. WHEN the Operation View loads, THE Sidebar SHALL check each tool's existence via the Tauri `check_tool_exists` command and display only tools with an active status
3. THE Sidebar SHALL render each tool item with the tool icon, tool name, and category badge
4. WHEN a user initiates a drag on a sidebar tool item, THE Sidebar SHALL attach the tool schema ID to the drag transfer data
5. THE Sidebar SHALL have a fixed width of approximately 250 pixels and use the application dark theme (background #131620, border-slate-700)

### Requirement 2: Canvas Drag and Drop

**User Story:** As a pentester, I want to drag tools from the sidebar onto the canvas, so that I can visually build my attack pipeline.

#### Acceptance Criteria

1. WHEN a tool item is dragged over the canvas, THE Canvas SHALL indicate it is a valid drop target by preventing the default dragover behavior
2. WHEN a tool item is dropped on the canvas, THE Canvas SHALL create a new Tool_Node at the drop coordinates with the corresponding tool schema, idle status, and empty configuration
3. WHEN a new Tool_Node is created, THE Canvas SHALL assign it a unique identifier

### Requirement 3: Custom Tool Node

**User Story:** As a pentester, I want each node on the canvas to display relevant tool information and status, so that I can understand my pipeline at a glance.

#### Acceptance Criteria

1. THE Tool_Node SHALL display the tool icon, tool name, and category label
2. THE Tool_Node SHALL display a status indicator reflecting one of four states: idle, running, completed, or failed
3. THE Tool_Node SHALL render an input handle on its left side (type "target") and an output handle on its right side (type "source")
4. WHEN a user clicks the context menu button on a Tool_Node, THE Tool_Node SHALL present options to delete, configure, or duplicate the node
5. WHEN a user selects "delete" from the context menu, THE Canvas SHALL remove that Tool_Node and all connected edges
6. WHEN a user selects "duplicate" from the context menu, THE Canvas SHALL create a copy of that Tool_Node with the same schema and configuration at an offset position

### Requirement 4: Node Connections

**User Story:** As a pentester, I want to connect tool nodes together, so that I can define the execution order and data flow of my attack chain.

#### Acceptance Criteria

1. WHEN a user drags from an output handle to an input handle, THE Canvas SHALL create an Edge connecting the two Tool_Nodes
2. WHILE the Operation_Status is EXECUTING, THE Canvas SHALL animate all edges to indicate active pipeline execution
3. WHILE the Operation_Status is IDLE or ARMING, THE Canvas SHALL render edges without animation

### Requirement 5: Operation Execution Controls

**User Story:** As a pentester, I want to execute my assembled pipeline and see its status, so that I can run multi-tool attack chains with a single action.

#### Acceptance Criteria

1. THE Canvas SHALL display an "Execute Operation" button in the top-right area styled with a red background matching the application theme
2. WHEN a user clicks the "Execute Operation" button, THE Canvas SHALL transition the Operation_Status from IDLE to EXECUTING and begin pipeline execution in topological order
3. THE Canvas SHALL display a status badge in the top-right area showing the current Operation_Status text ("IDLE", "ARMING", or "EXECUTING")
4. WHILE a Tool_Node is being executed, THE Canvas SHALL update that node's status to "running"
5. WHEN a Tool_Node execution completes successfully, THE Canvas SHALL update that node's status to "completed"
6. IF a Tool_Node execution fails, THEN THE Canvas SHALL update that node's status to "failed" and halt downstream execution

### Requirement 6: Canvas Navigation Controls

**User Story:** As a pentester, I want standard canvas navigation controls, so that I can pan, zoom, and orient myself within large pipelines.

#### Acceptance Criteria

1. THE Canvas SHALL render a MiniMap showing a thumbnail overview of all placed nodes
2. THE Canvas SHALL provide zoom-in, zoom-out, and fit-view control buttons
3. THE Canvas SHALL support pan navigation via mouse drag on empty canvas space
4. THE Canvas SHALL render a subtle dot-grid background pattern consistent with the dark theme (#0f1117)
