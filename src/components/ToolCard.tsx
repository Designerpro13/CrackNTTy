import type { ToolSchema, ToolStatus } from '../schemas/types'

interface ToolCardProps {
  schema: ToolSchema
  status: ToolStatus
  statusLoading: boolean
  onConfigure: (toolId: string) => void
}

export default function ToolCard({ schema, status, statusLoading, onConfigure }: ToolCardProps) {
  return (
    <div className="group bg-[#1a1f2e] border border-slate-700 rounded-lg p-5 hover:shadow-lg hover:shadow-black/20 hover:border-slate-600 transition-all duration-200 flex flex-col">
      {/* Header: icon + category */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{schema.icon}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {schema.category}
        </span>
      </div>

      {/* Name + description */}
      <h3 className="text-base font-bold text-slate-100 mb-1.5">{schema.name}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
        {schema.description}
      </p>

      {/* Footer: status + configure */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          {statusLoading ? (
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
          ) : status === 'active' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-500" />
          )}
          <span className={`text-xs font-medium ${
            statusLoading ? 'text-slate-500' : status === 'active' ? 'text-emerald-400' : 'text-slate-500'
          }`}>
            {statusLoading ? 'Checking...' : status === 'active' ? 'Active' : 'Idle'}
          </span>
        </div>
        <button
          onClick={() => onConfigure(schema.id)}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Configure →
        </button>
      </div>
    </div>
  )
}
