import { useState, useRef, useEffect } from 'react'
import { useLogStore, type LogLevel, type LogEntry } from '../stores/index'
import { useProcessStore } from '../stores/index'

const levelColors: Record<LogLevel, string> = {
  INFO: 'text-slate-400',
  WARN: 'text-yellow-400',
  EXPLOIT: 'text-red-400',
}

const levelBadgeColors: Record<LogLevel, string> = {
  INFO: 'bg-slate-700 text-slate-300',
  WARN: 'bg-yellow-900/50 text-yellow-400',
  EXPLOIT: 'bg-red-900/50 text-red-400',
}

const statusDotColors: Record<string, string> = {
  running: 'bg-blue-500',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
  killed: 'bg-slate-500',
}

export default function CliLogs() {
  const logs = useLogStore((s) => s.logs)
  const processes = useProcessStore((s) => s.processes)

  const [filters, setFilters] = useState<Record<LogLevel, boolean>>({
    INFO: true,
    WARN: true,
    EXPLOIT: true,
  })
  const [grep, setGrep] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)

  const logEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Count logs by level
  const counts: Record<LogLevel, number> = { INFO: 0, WARN: 0, EXPLOIT: 0 }
  for (const log of logs) counts[log.level]++

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (!filters[log.level]) return false
    if (grep && !log.message.toLowerCase().includes(grep.toLowerCase())) return false
    return true
  })

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs.length, autoScroll])

  // Detect manual scroll
  function handleScroll() {
    const el = scrollContainerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setAutoScroll(atBottom)
  }

  // Active processes
  const activeProcesses = Object.values(processes).filter((p) => p.status === 'running')

  return (
    <div className="flex flex-row h-full w-full bg-[#0f1117]">
      {/* Left sidebar */}
      <aside className="w-[220px] bg-[#131620] border-r border-slate-700 p-3 flex flex-col gap-4 overflow-y-auto">
        {/* Stream Filters */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Stream Filters
          </h3>
          <div className="space-y-1.5">
            {(['INFO', 'WARN', 'EXPLOIT'] as LogLevel[]).map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[level]}
                  onChange={(e) => setFilters((f) => ({ ...f, [level]: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className={`text-xs font-medium ${levelColors[level]}`}>
                  {level}
                </span>
                <span className="ml-auto text-[10px] text-slate-500">{counts[level]}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Grep */}
        <section>
          <input
            type="text"
            value={grep}
            onChange={(e) => setGrep(e.target.value)}
            placeholder="Grep pattern..."
            className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </section>

        {/* Active Daemons */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Active Daemons
          </h3>
          {activeProcesses.length === 0 ? (
            <p className="text-[10px] text-slate-600">No active processes</p>
          ) : (
            <div className="space-y-1.5">
              {activeProcesses.map((proc) => (
                <div key={proc.id} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusDotColors[proc.status]}`} />
                  <span className="text-xs text-slate-300 truncate">{proc.toolName}</span>
                  <span className="ml-auto text-[10px] text-slate-500">{proc.id.slice(0, 6)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>

      {/* Center: Log display */}
      <main className="flex-1 flex flex-col min-w-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto font-mono text-xs p-4 space-y-0.5"
        >
          {filteredLogs.length === 0 ? (
            <p className="text-slate-600 text-center mt-8">No logs to display</p>
          ) : (
            filteredLogs.map((log) => <LogLine key={log.id} log={log} />)
          )}
          <div ref={logEndRef} />
        </div>

        {/* Auto-scroll indicator */}
        {!autoScroll && (
          <button
            type="button"
            onClick={() => {
              setAutoScroll(true)
              logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="mx-4 mb-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200 self-center"
          >
            ↓ Resume auto-scroll
          </button>
        )}
      </main>

      {/* Right sidebar: Execution Timeline */}
      <aside className="w-[250px] bg-[#131620] border-l border-slate-700 p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Execution Timeline
        </h3>
        <div className="space-y-3">
          {Object.values(processes).map((proc) => (
            <div key={proc.id} className="flex items-start gap-2">
              <span className="mt-0.5">
                {proc.status === 'completed' && <span className="text-emerald-400 text-xs">✓</span>}
                {proc.status === 'running' && <span className="text-blue-400 text-xs">●</span>}
                {proc.status === 'failed' && <span className="text-red-400 text-xs">✗</span>}
                {proc.status === 'killed' && <span className="text-slate-500 text-xs">○</span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 truncate">{proc.toolName}</p>
                <p className="text-[10px] text-slate-500">{proc.startedAt}</p>
              </div>
            </div>
          ))}
          {Object.keys(processes).length === 0 && (
            <p className="text-[10px] text-slate-600">No executions yet</p>
          )}
        </div>
      </aside>
    </div>
  )
}

function LogLine({ log }: { log: LogEntry }) {
  return (
    <div className="flex gap-3 leading-5">
      <span className="text-slate-600 shrink-0">{log.timestamp}</span>
      <span className={`shrink-0 px-1.5 rounded text-[10px] font-semibold ${levelBadgeColors[log.level]}`}>
        {log.level}
      </span>
      <span className={`${levelColors[log.level]} break-all`}>{log.message}</span>
    </div>
  )
}
