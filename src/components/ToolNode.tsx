import { useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { ToolNodeData } from '../stores/operationStore'
import { useOperationStore } from '../stores/operationStore'
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

export function ToolNode({ id, data }: NodeProps<Node<ToolNodeData>>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleDelete() {
    useOperationStore.getState().removeNode(id)
    setMenuOpen(false)
  }

  function handleConfigure() {
    console.log('Configure node:', id)
    setMenuOpen(false)
  }

  function handleDuplicate() {
    useOperationStore.getState().duplicateNode(id)
    setMenuOpen(false)
  }

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

      {/* Context menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-8 right-2 bg-[#1a1f2e] border border-slate-700 rounded shadow-lg z-10 py-1 min-w-[120px]"
        >
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleConfigure}
            className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            Configure
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
          >
            Duplicate
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
