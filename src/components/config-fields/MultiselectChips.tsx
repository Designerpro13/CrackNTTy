interface MultiselectChipsProps {
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
}

export function MultiselectChips({ options, selected, onChange }: MultiselectChipsProps) {
  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            selected.includes(opt)
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
