import type { ToolSchema, Category } from '../schemas/types'

interface ToolSidebarProps {
  tools: ToolSchema[]
}

const categoryDisplayMap: Record<Category, string> = {
  Reconnaissance: 'Active Recon',
  Exploitation: 'Exploit Modules',
  Analysis: 'Credential Harvesting',
}

export function ToolSidebar({ tools }: ToolSidebarProps) {
  const grouped = tools.reduce<Record<string, ToolSchema[]>>((acc, tool) => {
    const label = categoryDisplayMap[tool.category]
    if (!acc[label]) acc[label] = []
    acc[label].push(tool)
    return acc
  }, {})

  function handleDragStart(event: React.DragEvent, schema: ToolSchema) {
    event.dataTransfer.setData('application/crackntty-tool', schema.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="w-[250px] bg-[#131620] border-r border-slate-700 overflow-y-auto h-full">
      <div className="p-3 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              {category}
            </h3>
            <div className="space-y-1.5">
              {items.map((schema) => (
                <div
                  key={schema.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, schema)}
                  className="flex items-center gap-2 bg-[#1a1f2e] rounded px-3 py-2 cursor-grab hover:bg-[#242a3d] hover:border-slate-600 border border-transparent transition-colors"
                >
                  <span className="text-lg leading-none">{schema.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200 truncate block">
                      {schema.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 whitespace-nowrap">
                    {categoryDisplayMap[schema.category]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
