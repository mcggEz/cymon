import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import BehavioralAssessmentForm from './BehavioralAssessmentForm'

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
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let on = true
    api.psychometrician
      .draftingReports()
      .then((d) => {
        if (!on) return
        setRows(d.rows)
        setSummary(d.summary)
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
    const mt = typeFilter === 'all' || r.type === typeFilter
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && mt && ms
  })

  return (
    <>
      <StaffHeader title="Drafting Reports" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">Report Ledger</h1>
            <p className="text-sm text-slate-500">
              Statuses of Daily Activity Reports and Monthly Summary Progress reports.
            </p>
          </div>
          <button
            onClick={() => setOpenForm('behavioral')}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            Open Behavioral Assessment Form
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value={summary?.draft ?? '—'} label="Draft" loading={loading} />
          <Stat value={summary?.submitted ?? '—'} label="Submitted" loading={loading} />
          <Stat value={summary?.approved ?? '—'} label="Approved" loading={loading} />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by student or report…"
              className="w-64"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Report Types</option>
              <option value="daily_activity">Daily Activity Report</option>
              <option value="progress_summary">Monthly Summary Progress</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Report Type</th>
                  <th className="py-3 text-left">Student</th>
                  <th className="py-3 text-left">Title</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                      No reports match your filters.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  filtered.map((r) => {
                    const meta = STATUS_META[r.status] || STATUS_META.draft
                    return (
                      <tr key={`${r.type}-${r.id}`}>
                        <td className="py-3 text-slate-700">{r.typeLabel}</td>
                        <td className="py-3">
                          <div className="font-medium text-purple-800">{r.name}</div>
                          <div className="text-xs text-slate-500">ID: {r.sid}</div>
                        </td>
                        <td className="py-3 text-slate-700">{r.title}</td>
                        <td className="py-3 text-slate-600">{fmtDate(r.date)}</td>
                        <td className="py-3">
                          <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {openForm === 'behavioral' ? <BehavioralAssessmentForm onClose={() => setOpenForm(null)} /> : null}
      </div>
    </>
  )
}

export default DraftingReports
