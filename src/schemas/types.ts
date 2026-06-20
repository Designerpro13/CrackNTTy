export type ArgType = 'text' | 'number' | 'select' | 'file' | 'boolean' | 'multiselect'
export type Category = 'Reconnaissance' | 'Exploitation' | 'Analysis'
export type ParserType = 'xml' | 'json' | 'regex' | 'raw'
export type ToolStatus = 'active' | 'idle'

export interface ArgDef {
  id: string
  flag: string          // e.g. "-p", "--wordlist"
  label: string         // Human-readable label
  type: ArgType
  required: boolean
  default?: string
  options?: string[]    // For select/multiselect
  placeholder?: string
  isPositional?: boolean // No flag prefix (e.g. nmap target)
}

export interface ToolSchema {
  id: string
  name: string
  icon: string          // Emoji or icon identifier
  category: Category
  description: string
  command: string       // Binary name
  path: string          // Absolute path on system
  args: ArgDef[]
  outputFormat: string  // Expected output format hint
  parserType: ParserType
}

export interface ParsedOutput {
  raw: string
  structured: Record<string, unknown>
}

export interface VariableRef {
  toolId: string
  path: string          // dot-notation path into structured output
}
