import { useState } from 'react'
import { useTargetStore, type Target } from '../stores/index'

const statusColors: Record<Target['status'], { bg: string; text: string }> = {
  vulnerable: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  scanned: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  monitored: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
}

const riskyPorts = new Set([21, 23, 445, 3389, 5900, 8080])

export default function Targets() {
  const targets = useTargetStore((s) => s.targets)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = targets.find((t) => t.id === selectedId)

  // Subnet count (rough: unique /24s)
  const subnets = new Set(targets.map((t) => t.ip.split('.').slice(0, 3).join('.')))

  return (
    <div className="flex h-full w-full bg-[#0f1117]">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Active Engagements</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitoring {targets.length} nodes across {subnets.size} subnets
          </p>
        </div>

        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300 hover:bg-slate-700">
            Filter
          </button>
          <button className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium text-white">
            + Add Target
          </button>
        </div>

        {/* Grid */}
        {targets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No targets discovered yet. Run a scan to populate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => setSelectedId(target.id)}
                className={`text-left bg-[#1a1f2e] border rounded-lg p-4 hover:shadow-lg hover:border-slate-600 transition-all ${
                  selectedId === target.id ? 'border-blue-500' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-base font-mono font-bold text-slate-100">{target.ip}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[target.status].bg} ${statusColors[target.status].text}`}>
                    {target.status}
                  </span>
                </div>
                {target.hostname && (
                  <p className="text-xs text-slate-400 mb-2 truncate">{target.hostname}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {target.ports.slice(0, 6).map((p) => (
                    <span
                      key={p.port}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        riskyPorts.has(p.port)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {p.port}/{p.protocol}
                    </span>
                  ))}
                  {target.ports.length > 6 && (
                    <span className="text-[10px] text-slate-500">+{target.ports.length - 6}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-[300px] bg-[#131620] border-l border-slate-700 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-mono font-bold text-slate-100">{selected.ip}</h2>
            {selected.hostname && (
              <p className="text-sm text-slate-400">{selected.hostname}</p>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            {selected.os && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                {selected.os}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              Last: {selected.lastSeen}
            </span>
          </div>

          {/* Services */}
          <section className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Service Topology
            </h3>
            <div className="space-y-1.5">
              {selected.ports.map((p) => (
                <div key={p.port} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    riskyPorts.has(p.port) ? 'bg-red-500' : 'bg-slate-500'
                  }`} />
                  <span className="text-slate-300 font-mono">{p.port}</span>
                  <span className="text-slate-500">{p.protocol}</span>
                  <span className="ml-auto text-slate-400">{p.service}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CVEs */}
          {selected.cves && selected.cves.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Known Issues
              </h3>
              <div className="space-y-1">
                {selected.cves.map((cve) => (
                  <div key={cve} className="flex items-center gap-1.5 text-xs">
                    <span className="text-yellow-500">⚠</span>
                    <span className="text-slate-300 font-mono">{cve}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <button
            onClick={() => setSelectedId(null)}
            className="mt-4 w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </aside>
      )}
    </div>
  )
}
