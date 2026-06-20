import type { OperationStatus } from '../stores/operationStore'

interface OperationControlsProps {
  status: OperationStatus
  onExecute: () => void
  disabled: boolean
}

const statusBadgeStyles: Record<OperationStatus, string> = {
  IDLE: 'bg-slate-700',
  ARMING: 'bg-amber-600',
  EXECUTING: 'bg-red-600 animate-pulse',
}

export default function OperationControls({ status, onExecute, disabled }: OperationControlsProps) {
  const isDisabled = disabled || status === 'EXECUTING'

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onExecute}
        disabled={isDisabled}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Execute Operation
      </button>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase text-white ${statusBadgeStyles[status]}`}
      >
        {status}
      </span>
    </div>
  )
}
