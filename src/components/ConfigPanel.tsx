import { useEffect } from 'react'
import { useOperationStore } from '../stores/operationStore'
import { FieldRenderer } from './config-fields/FieldRenderer'

interface ConfigPanelProps {
  nodeId: string
  onClose: () => void
}

export default function ConfigPanel({ nodeId, onClose }: ConfigPanelProps) {
  const node = useOperationStore((s) => s.nodes.find((n) => n.id === nodeId))
  const updateNodeConfig = useOperationStore((s) => s.updateNodeConfig)

  // Close if node gets deleted
  useEffect(() => {
    if (!node) onClose()
  }, [node, onClose])

  // Escape key closes panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!node) return null

  const { schema, config } = node.data

  function getValue(argId: string, defaultVal?: string): string | boolean {
    if (argId in config) return config[argId]
    if (defaultVal !== undefined) return defaultVal
    return ''
  }

  return (
    <aside className="w-[350px] bg-[#131620] border-l border-slate-700 h-full flex flex-col overflow-hidden animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 shrink-0">
        <span className="text-xl">{schema.icon}</span>
        <h2 className="text-sm font-semibold text-slate-100 flex-1 truncate">
          {schema.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-lg leading-none px-1"
        >
          ×
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {schema.args.map((arg) => (
          <FieldRenderer
            key={arg.id}
            arg={arg}
            value={getValue(arg.id, arg.default)}
            onChange={(val) => updateNodeConfig(nodeId, arg.id, val)}
          />
        ))}
      </div>
    </aside>
  )
}
