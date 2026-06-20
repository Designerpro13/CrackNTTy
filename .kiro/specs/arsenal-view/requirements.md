# Requirements Document

## Introduction

The Arsenal View is the primary tool inventory dashboard for CrackNTTy. It presents all registered pentesting tools as visual cards in a filterable, searchable grid. Users can quickly assess tool availability (whether the binary exists on the system) and navigate to tool configuration from this view.

## Glossary

- **Arsenal_View**: The main dashboard component displaying all registered pentesting tools as cards in a responsive grid layout
- **Tool_Card**: A UI component representing a single pentesting tool, showing its icon, name, category, description, and availability status
- **Tool_Schema**: A data structure defining a pentesting tool's metadata (id, name, icon, category, description, command, path, args, outputFormat, parserType)
- **Category**: A classification for tools — one of Reconnaissance, Exploitation, or Analysis
- **Tool_Status**: The availability state of a tool binary on the local system — either "active" (binary exists at path) or "idle" (binary not found)
- **Filter_Pills**: Clickable category buttons that filter the displayed tool cards by category
- **Search_Filter**: A text input that filters displayed tool cards by matching against tool name or description

## Requirements

### Requirement 1: Display Tool Cards

**User Story:** As a pentester, I want to see all registered tools displayed as cards in a grid, so that I can quickly browse my available toolkit.

#### Acceptance Criteria

1. WHEN the Arsenal_View mounts, THE Arsenal_View SHALL render one Tool_Card for each entry in the tool schema registry
2. THE Arsenal_View SHALL display Tool_Cards in a responsive grid with 4 columns on large screens, 3 on medium, 2 on small, and 1 on extra-small screens
3. THE Tool_Card SHALL display the tool icon in the top-left area, the category as a tag in the top-right area, the tool name, and the tool description

### Requirement 2: Tool Availability Detection

**User Story:** As a pentester, I want to see which tools are installed on my system, so that I can identify which tools are ready to use and which need installation.

#### Acceptance Criteria

1. WHEN the Arsenal_View mounts, THE Arsenal_View SHALL invoke the Tauri `check_tool_exists` command for each tool's path to determine availability
2. WHEN `check_tool_exists` returns true for a tool, THE Tool_Card SHALL display an "Active" status with a green indicator dot
3. WHEN `check_tool_exists` returns false for a tool, THE Tool_Card SHALL display an "Idle" status with a gray indicator dot
4. WHILE tool availability checks are in progress, THE Arsenal_View SHALL display a loading state for the status indicators

### Requirement 3: Category Filtering

**User Story:** As a pentester, I want to filter tools by category, so that I can quickly find tools relevant to my current task phase.

#### Acceptance Criteria

1. THE Arsenal_View SHALL display Filter_Pills for "All Tools", "Reconnaissance", "Exploitation", and "Analysis"
2. WHEN a user selects a category Filter_Pill, THE Arsenal_View SHALL display only Tool_Cards matching that category
3. WHEN "All Tools" Filter_Pill is selected, THE Arsenal_View SHALL display all Tool_Cards regardless of category
4. THE Arsenal_View SHALL visually distinguish the currently active Filter_Pill from inactive ones

### Requirement 4: Search Filtering

**User Story:** As a pentester, I want to search tools by name or description, so that I can locate a specific tool without scrolling through the entire grid.

#### Acceptance Criteria

1. THE Arsenal_View SHALL provide a Search_Filter input field
2. WHEN a user types in the Search_Filter, THE Arsenal_View SHALL display only Tool_Cards whose name or description contains the search text (case-insensitive)
3. WHEN the Search_Filter is cleared, THE Arsenal_View SHALL display all Tool_Cards subject to the active category filter
4. THE Arsenal_View SHALL apply both the Search_Filter and the active category filter simultaneously

### Requirement 5: Tool Card Interaction

**User Story:** As a pentester, I want a clear action to configure a tool, so that I can set up tool parameters before running it in an operation.

#### Acceptance Criteria

1. THE Tool_Card SHALL display a "Configure →" action button
2. WHEN a user clicks the "Configure →" button, THE Arsenal_View SHALL navigate to or trigger the tool configuration flow for that specific tool

### Requirement 6: Visual Styling

**User Story:** As a pentester, I want a dark-themed, visually clear interface, so that the tool dashboard is comfortable for extended use and consistent with the application's design language.

#### Acceptance Criteria

1. THE Arsenal_View SHALL use a dark background color of `#0f1117` for the main content area
2. THE Tool_Card SHALL use a background color of `#1a1f2e` with a `border-slate-700` border and rounded corners
3. WHEN a user hovers over a Tool_Card, THE Tool_Card SHALL display an elevated shadow effect with a smooth transition
4. THE Filter_Pills SHALL use rounded-full styling with text-xs sizing
