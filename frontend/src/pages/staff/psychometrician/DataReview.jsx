import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import { useAuth } from '../../../auth/useAuth'
import CaregiverChecklistForm from './CaregiverChecklistForm'

const PAGE_SIZE = 20

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700' },
  processed: { label: 'PROCESSED', tone: 'bg-sky-100 text-sky-700' },
  scored: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700' },
  flagged: { label: 'FLAGGED', tone: 'bg-rose-100 text-rose-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')

function StatCard({ value, label, loading }) {
  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <div className="text-3xl font-bold text-slate-800">{value}</div>
      )}
      <div className="text-xs font-medium text-slate-600 mt-1">{label}</div>
    </div>
  )
}

function DataReview() {
  const { profile } = useAuth()
  const canApprove = ['psychologist', 'admin'].includes(profile?.role)
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [openForm, setOpenForm] = useState(false)

  const load = () =>
    api.psychometrician
      .dataReview()
      .then((d) => {
        setRows(d.rows)
        setSummary(d.summary)
      })
      .catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const statuses = [...new Set(rows.map((r) => r.status).filter(Boolean))]
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || (r.name || '').toLowerCase().includes(q) || (r.by || '').toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const markProcessed = async (id) => {
    setProcessing(true)
    try {
      await api.psychometrician.updateSubmission(id, { status: 'processed' })
      await load()
      setActive(null)
    } finally {
      setProcessing(false)
    }
  }

  const markApproved = async (id) => {
    setProcessing(true)
    try {
      await api.psychometrician.updateSubmission(id, { status: 'scored' })
      await load()
      setActive(null)
    } finally {
      setProcessing(false)
    }
  }

  const processed = active?.status === 'processed' || active?.status === 'scored'
  const approved = active?.status === 'scored'

  return (
    <>
      <StaffHeader title="Data Review" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-purple-800">Submitted Checklists</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Review parent observations to extract data for your Behavioral Reports.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={summary?.newSubmissions ?? '—'} label="New Submissions" loading={loading} />
          <StatCard value={summary?.flagged ?? '—'} label="Flagged Priority" loading={loading} />
          <StatCard value={summary?.approved ?? '—'} label="Approved by RPsy" loading={loading} />
        </div>

        <div className="mt-5 flex gap-6">
          <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <SearchBar
                value={query}
                onChange={(v) => {
                  setQuery(v)
                  setPage(1)
                }}
                placeholder="Search by student or caregiver…"
                className="w-72"
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
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {(STATUS_META[s] || STATUS_META.submitted).label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold tracking-wider text-purple-700">
                    <th className="py-3 px-4 text-left">Student Name</th>
                    <th className="py-3 px-4 text-left">Submitted By</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Clinician Status</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="mt-1 h-3 w-20" />
                          </td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-6 w-28" /></td>
                          <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        </tr>
                      ))
                    : null}
                  {!loading && filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-500">
                        No submissions match your search.
                      </td>
                    </tr>
                  ) : null}
                  {!loading &&
                    pageRows.map((r) => {
                      const meta = STATUS_META[r.status] || STATUS_META.submitted
                      const isSelected = active && active.id === r.id
                      return (
                        <tr
                          key={r.id}
                          className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-purple-800">
                              {r.name}
                            </div>
                            <div className="text-xs text-slate-500">ID: {r.sid}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {r.by} <span className="text-xs text-slate-500">({r.rel})</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{fmtDate(r.date)}</td>
                          <td className="py-3 px-4">
                            <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <RowAction variant="view" onClick={() => setActive(r)}>
                              View Details
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
                  <div className="text-lg font-semibold text-purple-800">Caregiver Observation</div>
                  <button onClick={() => setActive(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </button>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm border-b border-slate-100 pb-4">
                  <div className="col-span-2">
                    <dt className="text-[10px] uppercase tracking-wider text-slate-500">Student Name</dt>
                    <dd className="font-semibold text-purple-800">{active.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-slate-500">Respondent (Caregiver)</dt>
                    <dd className="font-semibold text-purple-800">
                      {active.by} <span className="text-xs font-normal text-slate-500">({active.rel})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-slate-500">Date of Submission</dt>
                    <dd className="font-semibold text-purple-800">{fmtDate(active.date)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[10px] uppercase tracking-wider text-slate-500">System Flag</dt>
                    <dd className="text-sm font-semibold text-rose-600">1 Critical Observation</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <div className="text-sm font-semibold text-purple-800">I. Social & Communication Skills</div>
                  <div className="mt-2 divide-y divide-purple-100">
                    <div className="flex items-center justify-between py-2 text-xs">
                      <span className="text-slate-700">1. Initiates interaction with peers/adults.</span>
                      <span className="rounded-md bg-rose-500 px-2 py-0.5 text-xs font-medium text-white">No</span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-xs">
                      <span className="text-slate-700">2. Answers simple WH-questions.</span>
                      <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">Yes</span>
                    </div>
                  </div>

                  <div className="mt-4 text-sm font-semibold text-purple-800">II. Behavioral Indicators</div>
                  <div className="mt-2 divide-y divide-purple-100">
                    <div className="flex items-center justify-between rounded-md bg-rose-50 px-2 py-1.5 text-xs">
                      <span className="text-rose-700">1. Experiences intense meltdowns &gt;10m.</span>
                      <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">Yes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setOpenForm(true)}
                    className="w-full rounded-md border border-purple-300 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                  >
                    View as Form
                  </button>
                  {!processed ? (
                    <button
                      onClick={() => markProcessed(active.id)}
                      disabled={processing}
                      className="w-full rounded-md bg-purple-700 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
                    >
                      {processing ? 'Working…' : 'Mark as Processed'}
                    </button>
                  ) : null}
                  {canApprove && !approved ? (
                    <button
                      onClick={() => markApproved(active.id)}
                      disabled={processing}
                      className="w-full rounded-md bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {processing ? 'Working…' : 'Approve'}
                    </button>
                  ) : null}
                  {approved ? (
                    <div className="rounded-md bg-emerald-100 py-2 text-center text-sm font-medium text-emerald-700">
                      Approved
                    </div>
                  ) : null}
                </div>
              </aside>
            </>
          ) : null}
        </div>
        {openForm ? (
          <CaregiverChecklistForm detail={active} readOnly={true} onClose={() => setOpenForm(false)} />
        ) : null}
      </div>
    </>
  )
}

export default DataReview
