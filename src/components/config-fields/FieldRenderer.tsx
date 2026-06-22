import type { ArgDef } from '../../schemas/types'
import { TextInput } from './TextInput'
import { NumberInput } from './NumberInput'
import { SelectField } from './SelectField'
import { FlagChips } from './FlagChips'
import { FileInput } from './FileInput'
import { BooleanToggle } from './BooleanToggle'
import { MultiselectChips } from './MultiselectChips'

interface FieldRendererProps {
  arg: ArgDef
  value: string | boolean
  onChange: (value: string | boolean) => void
}

function isFlagOptions(arg: ArgDef): boolean {
  return (
    arg.type === 'select' &&
    arg.options !== undefined &&
    arg.options.length > 0 &&
    arg.options.every((opt) => opt.startsWith('-'))
  )
}

export function FieldRenderer({ arg, value, onChange }: FieldRendererProps) {
  const strVal = typeof value === 'string' ? value : ''
  const boolVal = typeof value === 'boolean' ? value : false

  let field: React.ReactNode

  switch (arg.type) {
    case 'text':
      field = <TextInput arg={arg} value={strVal} onChange={onChange} />
      break
    case 'number':
      field = <NumberInput arg={arg} value={strVal} onChange={onChange} />
      break
    case 'select':
      if (isFlagOptions(arg)) {
        field = <FlagChips options={arg.options!} selected={strVal} onChange={onChange} />
      } else {
        field = <SelectField arg={arg} value={strVal} onChange={onChange} />
      }
      break
    case 'file':
      field = <FileInput arg={arg} value={strVal} onChange={onChange} />
      break
    case 'boolean':
      field = <BooleanToggle value={boolVal} onChange={onChange} />
      break
    case 'multiselect':
      field = (
        <MultiselectChips
          options={arg.options || []}
          selected={strVal ? strVal.split(',') : []}
          onChange={(vals) => onChange(vals.join(','))}
        />
      )
      break
    default:
      field = <TextInput arg={arg} value={strVal} onChange={onChange} />
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-xs font-medium text-slate-400">
        {arg.label}
        {arg.required && <span className="text-rose-400">*</span>}
      </label>
      {field}
    </div>
  )
}
