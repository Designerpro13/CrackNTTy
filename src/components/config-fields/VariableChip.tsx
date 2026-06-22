interface VariableChipProps {
  reference: string
  onRemove: () => void
}

export function VariableChip({ reference, onRemove }: VariableChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30">
      {reference}
      <button
        type="button"
        onClick={onRemove}
        className="text-rose-400 hover:text-rose-200 ml-0.5"
      >
        ×
      </button>
    </span>
  )
}
