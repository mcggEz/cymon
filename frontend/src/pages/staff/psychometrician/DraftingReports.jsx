import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Pagination from '../../../components/ui/Pagination'
import RowAction from '../../../components/ui/RowAction'
import BehavioralAssessmentForm from './BehavioralAssessmentForm'
import ProgressSummaryReportForm from '../psychologist/ProgressSummaryReportForm'

const PAGE_SIZE = 20

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700' },
  approved: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')

const Stat = ({ value, label, loading }) => (
  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-slate-800">{value}</div>}
    <div className="text-xs font-medium text-slate-600">{label}</div>
  </div>
)

function DraftingReports() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [patients, setPatients] = useState([])

  useEffect(() => {
    let on = true
    api.psychometrician
      .draftingReports()
      .then((d) => {
        if (!on) return
        setRows(d.rows)
        setSummary(d.summary)
        setPatients(d.patients || [])
      })
      .catch(() => {})
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || (r.name || '').toLowerCase().includes(q) || (r.title || '').toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Behavioral Reports" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">Behavioral Assessment Reports</h1>
            <p className="text-sm text-slate-500">
              Draft, submit, and review client behavioral assessment logs (CMPS:SE-FO-06).
            </p>
          </div>
          <button
            onClick={() => setOpenForm('behavioral')}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
          >
            + Write Behavioral Assessment Report
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value={summary?.draft ?? '—'} label="Draft" loading={loading} />
          <Stat value={summary?.submitted ?? '—'} label="Submitted" loading={loading} />
          <Stat value={summary?.approved ?? '—'} label="Approved" loading={loading} />
        </div>

        <div className="mt-5 flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search by student or report…"
              className="w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Report Title</th>
                  <th className="py-3 px-4 text-left">Last Updated Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3 px-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-500">
                      No reports match your filters.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  pageRows.map((r) => {
                    const meta = STATUS_META[r.status] || STATUS_META.draft
                    const isSelected = active && active.id === r.id && active.type === r.type
                    return (
                      <tr
                        key={`${r.type}-${r.id}`}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-purple-800">{r.name}</div>
                          <div className="text-xs text-slate-500">ID: {r.sid}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{r.title}</td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(r.date)}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <RowAction variant="view" onClick={() => setActive(r)}>
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
            <aside className="fixed inset-y-0 right-0 z-40 w-80 bg-white p-6 shadow-xl lg:static lg:w-72 lg:shadow-none shrink-0 border-l border-slate-100 flex flex-col justify-start">
              <h2 className="text-lg font-bold text-purple-800 border-b border-purple-50 pb-3">Report Details</h2>
              <dl className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Student</span>
                  <span className="font-semibold text-purple-800 text-sm">{active.name || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">ID</span>
                  <span className="font-semibold text-slate-800">{active.sid || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Title</span>
                  <span className="font-semibold text-slate-800">{active.title || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Date</span>
                  <span className="font-semibold text-slate-800">{fmtDate(active.date)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Status</span>
                  <span className="font-semibold text-slate-800">{(STATUS_META[active.status] || STATUS_META.draft).label}</span>
                </div>
              </dl>
              <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => setOpenForm('viewBehavioral')}
                  className="w-full rounded-md border border-purple-300 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                >
                  View as Form
                </button>
              </div>
            </aside>
          </>
        ) : null}
        </div>

        {openForm === 'behavioral' ? <BehavioralAssessmentForm onClose={() => setOpenForm(null)} /> : null}
        {openForm === 'viewBehavioral' ? (
          <BehavioralAssessmentForm detail={active} readOnly={true} onClose={() => setOpenForm(null)} />
        ) : null}
      </div>
    </>
  )
}

export default DraftingReports
