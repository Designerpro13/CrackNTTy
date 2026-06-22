import type { ArgDef } from '../../schemas/types'

interface NumberInputProps {
  arg: ArgDef
  value: string
  onChange: (value: string) => void
}

export function NumberInput({ arg, value, onChange }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={arg.placeholder || ''}
      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
    />
  )
}
