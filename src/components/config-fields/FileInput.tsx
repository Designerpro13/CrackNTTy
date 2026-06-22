import type { ArgDef } from '../../schemas/types'

interface FileInputProps {
  arg: ArgDef
  value: string
  onChange: (value: string) => void
}

export function FileInput({ arg, value, onChange }: FileInputProps) {
  async function handleBrowse() {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({ multiple: false })
      if (selected) {
        onChange(typeof selected === 'string' ? selected : selected[0])
      }
    } catch {
      // Dialog unavailable or cancelled — no-op
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={arg.placeholder || 'Select file...'}
        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      <button
        type="button"
        onClick={handleBrowse}
        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs font-medium text-slate-300 hover:bg-slate-600 transition-colors"
      >
        Browse
      </button>
    </div>
  )
}
