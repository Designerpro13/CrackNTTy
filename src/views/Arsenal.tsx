import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { toolSchemas } from '../schemas'
import { Category, ToolStatus } from '../schemas/types'
import ToolCard from '../components/ToolCard'

type FilterCategory = 'All Tools' | Category

const categories: FilterCategory[] = ['All Tools', 'Reconnaissance', 'Exploitation', 'Analysis']

export default function Arsenal() {
  const [filter, setFilter] = useState<FilterCategory>('All Tools')
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<Record<string, ToolStatus>>({})
  const [loading, setLoading] = useState(true)

  // Check tool availability on mount
  useEffect(() => {
    async function checkTools() {
      setLoading(true)
      const results: Record<string, ToolStatus> = {}

      await Promise.all(
        toolSchemas.map(async (tool) => {
          try {
            const exists = await invoke<boolean>('check_tool_exists', { path: tool.path })
            results[tool.id] = exists ? 'active' : 'idle'
          } catch {
            results[tool.id] = 'idle'
          }
        })
      )

      setStatuses(results)
      setLoading(false)
    }

    checkTools()
  }, [])

  // Filter tools by category and search
  const filteredTools = toolSchemas.filter((tool) => {
    const matchesCategory = filter === 'All Tools' || tool.category === filter
    const matchesSearch =
      search === '' ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleConfigure = (toolId: string) => {
    // TODO: navigate to config or open panel
    console.log('Configure:', toolId)
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0f1117] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Arsenal</h1>
        <p className="text-sm text-slate-400 mt-1">
          {toolSchemas.length} tools registered · {Object.values(statuses).filter(s => s === 'active').length} active
        </p>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-4 mb-6">
        {/* Category pills */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto">
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 placeholder-slate-500 w-56 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            schema={tool}
            status={statuses[tool.id] || 'idle'}
            statusLoading={loading}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No tools match your filters.</p>
        </div>
      )}
    </div>
  )
}
