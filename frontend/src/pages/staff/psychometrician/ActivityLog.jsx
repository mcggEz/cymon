import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Pagination from '../../../components/ui/Pagination'
import DailyActivityReportForm from './DailyActivityReportForm'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'

const PAGE_SIZE = 20

const STATUS_META = {
  draft: { label: 'Draft', tone: 'bg-amber-100 text-amber-700', action: 'Edit Log' },
  pending: { label: 'Pending', tone: 'bg-sky-100 text-sky-700', action: 'View Details' },
  approved: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-700', action: 'View Details' },
}
const dayOf = (d) => (d ? String(new Date(d).getDate()) : '')
const monOf = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '')

function ActivityLog() {
  const [active, setActive] = useState(null)
  const [openForm, setOpenForm] = useState(null)
  const [rows, setRows] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = () =>
    api.psychometrician
      .activityLogs()
      .then((d) => {
        setRows(d.rows)
        setPatients(d.patients || [])
      })
      .catch(() => {})

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || r.name.toLowerCase().includes(q) || (r.detail || '').toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Daily Activity Report" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Session Log History</h1>
              <p className="text-sm text-slate-500">
                Review past sessions, edit drafts, or track approval statuses.
              </p>
            </div>
            <button
              onClick={() => setOpenForm('dailyActivity')}
              className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Open Daily Activity Report Form
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search by student name or activity…"
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Activity</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3 px-4">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-500">
                      {q ? 'No session logs match your search.' : 'No session logs yet.'}
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  pageRows.map((r) => {
                    const meta = STATUS_META[r.status] || STATUS_META.draft
                    const isSelected = active && active.id === r.id
                    const formattedDate = r.date
                      ? new Date(r.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'
                    return (
                      <tr
                        key={r.id}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4 font-medium text-purple-800">{r.name}</td>
                        <td className="py-3 px-4 text-slate-600">{formattedDate}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.session_number ? `Session ${r.session_number} · ` : ''}{r.detail}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <RowAction
                            variant="view"
                            onClick={() => setActive({ ...r, day: dayOf(r.date), mon: monOf(r.date) })}
                          >
                            View
                          </RowAction>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
        </section>

        {active ? (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setActive(null)} aria-hidden="true" />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-purple-800">Daily Activity Report</div>
                <button onClick={() => setActive(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="text-xs text-slate-500">CMPS:SE-FO-07</div>

              <div className="mt-4 text-xs font-semibold tracking-wider text-purple-700">
                ACTIVITY DETAILS
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Student Name</div>
                  <div className="font-semibold text-purple-800">{active.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Date of Activity</div>
                  <div className="font-semibold text-purple-800">
                    {active.mon} {active.day}
                    {active.session_number ? ` · Session ${active.session_number}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Activity Title</div>
                  <div className="font-semibold text-purple-800">{active.detail || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Target Domain</div>
                  <div className="font-semibold text-purple-800">{active.target_domain || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
                  <div className="font-semibold capitalize text-purple-800">{active.status}</div>
                </div>
              </div>

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">OBJECTIVES</div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{active.objectives || '—'}</p>

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">ACTIVITY PROCEDURE</div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{active.procedure || '—'}</p>

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
                BEHAVIORAL OBSERVATIONS
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{active.observations || '—'}</p>

              <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => setOpenForm('viewActivity')}
                  className="w-full rounded-md border border-purple-300 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                >
                  View as Form
                </button>
              </div>
            </aside>
          </>
        ) : null}
        </div>

        {openForm === 'dailyActivity' ? (
          <DailyActivityReportForm patients={patients} onSaved={load} onClose={() => setOpenForm(null)} />
        ) : null}
        {openForm === 'viewActivity' ? (
          <DailyActivityReportForm patients={patients} detail={active} readOnly={true} onClose={() => setOpenForm(null)} />
        ) : null}
      </div>
    </>
  )
}

export default ActivityLog
