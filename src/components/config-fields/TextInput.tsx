import { useState, useRef } from 'react'
import type { ArgDef } from '../../schemas/types'
import { VariableAutocomplete } from './VariableAutocomplete'
import { VariableChip } from './VariableChip'

interface TextInputProps {
  arg: ArgDef
  value: string
  onChange: (value: string) => void
}

export function TextInput({ arg, value, onChange }: TextInputProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isVariable = value.startsWith('$') && value.length > 1 && !value.includes(' ')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    setShowAutocomplete(val.includes('$'))
  }

  function handleVariableSelect(ref: string) {
    onChange(ref)
    setShowAutocomplete(false)
  }

  function handleRemoveVariable() {
    onChange('')
    inputRef.current?.focus()
  }

  if (isVariable) {
    return (
      <div className="relative">
        <VariableChip reference={value} onRemove={handleRemoveVariable} />
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={arg.placeholder || ''}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {showAutocomplete && (
        <VariableAutocomplete
          filter={value.split('$').pop() || ''}
          onSelect={handleVariableSelect}
          onDismiss={() => setShowAutocomplete(false)}
        />
      )}
    </div>
  )
}
