import { useVariableStore } from '../../stores/index'

interface VariableAutocompleteProps {
  filter: string
  onSelect: (ref: string) => void
  onDismiss: () => void
}

function flattenVariables(
  obj: Record<string, unknown>,
  prefix: string,
  depth: number,
): string[] {
  if (depth > 3) return []
  const results: string[] = []
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    results.push(`$${path}`)
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      results.push(...flattenVariables(val as Record<string, unknown>, path, depth + 1))
    }
  }
  return results
}

export function VariableAutocomplete({ filter, onSelect, onDismiss }: VariableAutocompleteProps) {
  const variables = useVariableStore((s) => s.variables)

  const allPaths = flattenVariables(variables, '', 0)
  const filtered = filter
    ? allPaths.filter((p) => p.toLowerCase().includes(filter.toLowerCase()))
    : allPaths

  if (filtered.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-slate-700 rounded shadow-lg z-20 p-2">
        <span className="text-xs text-slate-500">No variables available</span>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-slate-700 rounded shadow-lg z-20 max-h-40 overflow-y-auto">
      {filtered.map((ref) => (
        <button
          key={ref}
          type="button"
          onClick={() => onSelect(ref)}
          onMouseDown={(e) => e.preventDefault()}
          className="w-full text-left px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 hover:text-slate-100"
        >
          {ref}
        </button>
      ))}
      <button
        type="button"
        onClick={onDismiss}
        className="w-full text-left px-3 py-1 text-[10px] text-slate-500 hover:text-slate-400 border-t border-slate-700"
      >
        Dismiss
      </button>
    </div>
  )
}
