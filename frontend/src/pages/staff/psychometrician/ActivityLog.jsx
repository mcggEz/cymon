import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Pagination from '../../../components/ui/Pagination'
import DailyActivityReportForm from './DailyActivityReportForm'

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

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm text-slate-500">
              <input placeholder="Search by student name or activity…" className="flex-1 bg-transparent outline-none" />
            </div>
            <select className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm">
              <option>All Statuses</option>
            </select>
          </div>

          <ul className="mt-4 divide-y divide-purple-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="py-4">
                  <Skeleton className="h-12 w-full" />
                </li>
              ))
            ) : (
              <>
            {rows.length === 0 ? (
              <li className="py-4 text-sm text-slate-500">No session logs yet.</li>
            ) : null}
            {pageRows.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.draft
              return (
              <li
                key={r.id}
                onClick={() => setActive({ ...r, day: dayOf(r.date), mon: monOf(r.date) })}
                className="flex cursor-pointer items-center gap-4 py-4 hover:bg-purple-50/40"
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-purple-100 text-purple-800">
                  <div className="text-base font-bold leading-none">{dayOf(r.date)}</div>
                  <div className="text-[9px] font-semibold tracking-wider">{monOf(r.date)}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-800">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {r.session_number ? `Session ${r.session_number} · ` : ''}{r.detail}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
              </li>
              )
            })}
              </>
            )}
          </ul>
          <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
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
            </aside>
          </>
        ) : null}
        </div>

        {openForm === 'dailyActivity' ? (
          <DailyActivityReportForm patients={patients} onSaved={load} onClose={() => setOpenForm(null)} />
        ) : null}
      </div>
    </>
  )
}

export default ActivityLog
