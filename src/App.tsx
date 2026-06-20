import { useState } from 'react'
import Arsenal from './views/Arsenal'
import Operation from './views/Operation'
import CliLogs from './views/CliLogs'
import Targets from './views/Targets'

const views = ['Arsenal', 'Operation', 'CLI-Logs', 'Targets'] as const
type View = (typeof views)[number]

const viewComponents: Record<View, () => React.JSX.Element> = {
  Arsenal,
  Operation,
  'CLI-Logs': CliLogs,
  Targets,
}

export default function App() {
  const [active, setActive] = useState<View>('Arsenal')
  const ActiveView = viewComponents[active]

  return (
    <>
      <nav className="flex items-center border-b border-slate-800 bg-[#131620] px-6">
        <span className="font-bold text-lg text-white mr-8 py-3 tracking-tight">
          CrackNTTy
        </span>
        <div className="flex gap-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setActive(v)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                active === v
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v}
              {active === v && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-300 placeholder-slate-500 w-48 focus:outline-none focus:border-blue-500"
          />
        </div>
      </nav>
      <ActiveView />
    </>
  )
}
