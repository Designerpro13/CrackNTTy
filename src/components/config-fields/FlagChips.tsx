interface FlagChipsProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
}

export function FlagChips({ options, selected, onChange }: FlagChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === selected ? '' : opt)}
          className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
            opt === selected
              ? 'bg-indigo-600 text-white border border-indigo-500'
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
