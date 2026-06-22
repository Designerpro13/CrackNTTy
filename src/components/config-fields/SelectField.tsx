import type { ArgDef } from '../../schemas/types'

interface SelectFieldProps {
  arg: ArgDef
  value: string
  onChange: (value: string) => void
}

export function SelectField({ arg, value, onChange }: SelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
    >
      <option value="">Select...</option>
      {arg.options?.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
