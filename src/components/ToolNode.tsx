import { useState } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { ToolNodeData } from '../stores/operationStore'
import type { Category } from '../schemas/types'

const categoryDisplayMap: Record<Category, string> = {
  Reconnaissance: 'Active Recon',
  Exploitation: 'Exploit Modules',
  Analysis: 'Credential Harvesting',
}

const statusDotClass: Record<ToolNodeData['status'], string> = {
  idle: 'bg-slate-500',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
}

export function ToolNode({ data }: NodeProps<Node<ToolNodeData>>) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative bg-[#1a1f2e] border border-slate-700 rounded-lg min-w-[180px] shadow px-3 py-2.5">
      <Handle type="target" position={Position.Left} />

      {/* Header row: icon + name + menu button */}
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{data.schema.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-200 truncate block">
            {data.schema.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="text-slate-400 hover:text-slate-200 text-sm leading-none px-1"
        >
          ...
        </button>
      </div>

      {/* Category label + status dot */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
          {categoryDisplayMap[data.schema.category]}
        </span>
        <span className={`w-2 h-2 rounded-full ${statusDotClass[data.status]}`} />
      </div>

      {/* Dropdown placeholder — menu actions implemented in task 4.2 */}
      {menuOpen && (
        <div className="absolute top-8 right-2 bg-[#1a1f2e] border border-slate-700 rounded shadow-lg z-10 py-1 min-w-[120px]">
          {/* Menu items will be added in task 4.2 */}
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
