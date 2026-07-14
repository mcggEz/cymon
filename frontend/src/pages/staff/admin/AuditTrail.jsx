import { useEffect, useMemo, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import Pagination from '../../../components/ui/Pagination'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

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
  const [page, setPage] = useState(1)

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

  const pageRows = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all font-sans"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
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

        <div className="mt-5 flex gap-6">
          <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-xs font-semibold tracking-wider text-purple-700">
                    <th className="py-3 px-4 text-left">Timestamp</th>
                    <th className="py-3 px-4 text-left">Actor</th>
                    <th className="py-3 px-4 text-left">Action</th>
                    <th className="py-3 px-4 text-left">Detail</th>
                    <th className="py-3 px-4 text-left">Severity</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`s${i}`}>
                        <td colSpan="6" className="py-3 px-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-6 px-4 text-center text-sm text-slate-500">
                        {logs.length === 0 ? 'No audit activity recorded yet.' : 'No matching audit logs found.'}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((log) => {
                      const sev = SEVERITY_META[log.severity] || SEVERITY_META.info
                      const isSelected = selectedLog && selectedLog.id === log.id
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className={`group cursor-pointer transition-colors ${isSelected ? 'bg-purple-100/70 font-medium' : 'hover:bg-purple-50/40'}`}
                        >
                          <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                            {log.actor}
                            {log.actor_role ? (
                              <span className="ml-1 text-[10px] font-normal text-slate-400">({titleCase(log.actor_role)})</span>
                            ) : null}
                          </td>
                          <td className="py-3 px-4 text-xs whitespace-nowrap">
                            <span className="inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                              {titleCase(log.action)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 font-light max-w-xs md:max-w-md truncate group-hover:text-slate-800 transition-colors">
                            {log.summary}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-full text-[10px] uppercase tracking-wider border ${sev.cls}`}>
                              {sev.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedLog(log)
                              }}
                              className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filteredLogs.length} onPage={setPage} />
          </section>

          {selectedLog ? (
            <>
              <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSelectedLog(null)} aria-hidden="true" />
              <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold text-purple-800">Log Details</div>
                  <button onClick={() => setSelectedLog(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <div className="text-xs text-slate-500 mb-4 font-mono">ID: {selectedLog.id}</div>

                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Timestamp</span>
                    <span className="font-medium text-purple-800">{fmtDateTime(selectedLog.created_at)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Severity</span>
                    <div>
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${(SEVERITY_META[selectedLog.severity] || SEVERITY_META.info).cls}`}>
                        {(SEVERITY_META[selectedLog.severity] || SEVERITY_META.info).label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Actor</span>
                    <span className="font-medium text-purple-800">
                      {selectedLog.actor}
                      {selectedLog.actor_role ? (
                        <span className="text-slate-500 font-normal"> ({titleCase(selectedLog.actor_role)})</span>
                      ) : null}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Action</span>
                    <div className="mt-0.5">
                      <span className="inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                        {titleCase(selectedLog.action)}
                      </span>
                      {selectedLog.entity_type ? (
                        <span className="ml-2 text-xs text-slate-500">on {titleCase(selectedLog.entity_type)}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Event Summary</span>
                    <p className="mt-1 leading-relaxed text-slate-700 font-light whitespace-pre-wrap">{selectedLog.summary}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="w-full rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </aside>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default AuditTrail
