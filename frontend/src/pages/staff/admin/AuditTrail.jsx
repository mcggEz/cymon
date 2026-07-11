import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import { api } from '../../../lib/api'

const SEVERITY_META = {
  info: { label: 'INFO', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  warning: { label: 'WARNING', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { label: 'CRITICAL', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const titleCase = (s) => (s || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

function AuditTrail() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    let on = true
    api.admin
      .audit()
      .then((d) => on && setLogs(d.logs))
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const actions = useMemo(
    () => ['All', ...Array.from(new Set(logs.map((l) => l.action).filter(Boolean)))],
    [logs]
  )

  const q = searchTerm.trim().toLowerCase()
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !q ||
      (log.actor || '').toLowerCase().includes(q) ||
      (log.summary || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q)
    const matchesAction = actionFilter === 'All' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <>
      <StaffHeader title="System Audit Trail" />

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Compliance & Activity Logs</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
            A read-only record of state-changing actions across the clinic — who did what, and when.
            Every entry is appended to the audit log for retrospective review.
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by actor, detail or action…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all font-sans"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet cursor-pointer font-sans"
            >
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a === 'All' ? 'All' : titleCase(a)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Timestamp</th>
                  <th className="py-3 text-left">Actor</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left">Detail</th>
                  <th className="py-3 text-left">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`s${i}`}>
                      <td colSpan="5" className="py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-sm text-slate-500">
                      {logs.length === 0 ? 'No audit activity recorded yet.' : 'No matching audit logs found.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const sev = SEVERITY_META[log.severity] || SEVERITY_META.info
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="group cursor-pointer transition-colors hover:bg-purple-50/40"
                      >
                        <td className="py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
                        <td className="py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {log.actor}
                          {log.actor_role ? (
                            <span className="ml-1 text-[10px] font-normal text-slate-400">({titleCase(log.actor_role)})</span>
                          ) : null}
                        </td>
                        <td className="py-3 text-xs whitespace-nowrap">
                          <span className="inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                            {titleCase(log.action)}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-600 font-light max-w-xs md:max-w-md truncate group-hover:text-slate-800 transition-colors">
                          {log.summary}
                        </td>
                        <td className="py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-full text-[10px] uppercase tracking-wider border ${sev.cls}`}>
                            {sev.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedLog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 border-b border-purple-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Audit Log Details</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {selectedLog.id}</p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Timestamp</span>
                    <span className="text-sm font-semibold text-slate-800">{fmtDateTime(selectedLog.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Severity</span>
                    <span className="text-sm font-semibold text-slate-800">{(SEVERITY_META[selectedLog.severity] || SEVERITY_META.info).label}</span>
                  </div>
                </div>

                <div className="border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Actor</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedLog.actor}
                    {selectedLog.actor_role ? ` (${titleCase(selectedLog.actor_role)})` : ''}
                  </span>
                </div>

                <div className="border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Action</span>
                  <span className="text-xs inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded uppercase mt-0.5 tracking-wider">
                    {titleCase(selectedLog.action)}
                  </span>
                  {selectedLog.entity_type ? (
                    <span className="ml-2 text-xs text-slate-500">on {titleCase(selectedLog.entity_type)}</span>
                  ) : null}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Event Summary</span>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed font-light">{selectedLog.summary}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AuditTrail
