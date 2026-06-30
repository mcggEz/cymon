import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Modal from '../../../components/ui/Modal'

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700' },
  processed: { label: 'PROCESSED & DRAFTED', tone: 'bg-sky-100 text-sky-700' },
  scored: { label: 'APPROVED BY RPSY', tone: 'bg-emerald-100 text-emerald-700' },
  flagged: { label: 'FLAGGED', tone: 'bg-rose-100 text-rose-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')

function ChecklistModal({ row, onClose, onProcess, processing }) {
  const done = row.status === 'processed' || row.status === 'scored'
  return (
    <Modal
      title="Caregiver Observation Checklist"
      subtitle="CMPS:SE-FO-03 · Submitted via Parent Portal"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Use this data to draft the Behavioral Assessment Report.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              Close Viewer
            </button>
            {done ? (
              <span className="rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                Processed ✓
              </span>
            ) : (
              <button
                onClick={() => onProcess(row.id)}
                disabled={processing}
                className="rounded-md bg-purple-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
              >
                {processing ? 'Processing…' : 'Mark as Processed ✓'}
              </button>
            )}
          </div>
        </div>
      }
    >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Student Name
            </div>
            <div className="font-semibold text-purple-800">{row.name}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Respondent (Caregiver)
            </div>
            <div className="font-semibold text-purple-800">
              {row.by} <span className="text-xs font-normal text-slate-500">({row.rel})</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Date of Submission
            </div>
            <div className="font-semibold text-purple-800">{row.date}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              System Flag
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-rose-600">
              <span>⚑</span> 1 Critical Observation
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-purple-800">I. Social & Communication Skills</div>
          <div className="mt-2 divide-y divide-purple-100">
            <div className="flex items-center justify-between py-2 text-sm">
              <span>1. Initiates interaction with peers or adults appropriately.</span>
              <span className="rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white">No</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span>2. Answers simple WH-questions effectively.</span>
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white">Yes</span>
            </div>
          </div>

          <div className="mt-4 text-sm font-semibold text-purple-800">II. Behavioral Indicators</div>
          <div className="mt-2 divide-y divide-purple-100">
            <div className="flex items-center justify-between rounded-md bg-rose-50 px-2 py-2 text-sm">
              <span className="text-rose-700">
                1. Experiences intense meltdowns lasting more than 10 minutes. <span>⚑</span>
              </span>
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white">Yes</span>
            </div>
          </div>
        </div>
    </Modal>
  )
}

function StatCard({ value, label, icon, loading }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-purple-100/70 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-purple-700">
        {icon}
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <div className="text-3xl font-bold text-purple-800">{value}</div>
        )}
        <div className="text-xs font-medium text-slate-600">{label}</div>
      </div>
    </div>
  )
}

function DataReview() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  return (
    <>
      <StaffHeader
        title="Caregiver Data Review"
        subtitle="Behavioral Observation Checklists"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-purple-800">Submitted Checklists</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Review parent observations to extract data for your Behavioral Reports.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={summary?.newSubmissions ?? '—'} label="New Submissions" icon="✉" loading={loading} />
          <StatCard value={summary?.flagged ?? '—'} label="Flagged Priority" icon="⚑" loading={loading} />
          <StatCard value={summary?.approved ?? '—'} label="Approved by RPsy" icon="✓" loading={loading} />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by student or caregiver…"
              className="w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                  <th className="py-3 text-left">Student Name</th>
                  <th className="py-3 text-left">Submitted By</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Clinician Status</th>
                  <th className="py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="py-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="mt-1 h-3 w-20" />
                        </td>
                        <td className="py-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3"><Skeleton className="h-6 w-28" /></td>
                        <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                      No submissions match your search.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  filtered.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.submitted
                  return (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2 font-medium text-purple-800">
                        {r.name}
                        {r.flag ? <span className="text-rose-500">⚑</span> : null}
                      </div>
                      <div className="text-xs text-slate-500">ID: {r.sid}</div>
                    </td>
                    <td className="py-3 text-slate-700">
                      {r.by} <span className="text-xs text-slate-500">({r.rel})</span>
                    </td>
                    <td className="py-3 text-slate-600">{fmtDate(r.date)}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3">
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
        </section>

        {active ? (
          <ChecklistModal
            row={active}
            onClose={() => setActive(null)}
            onProcess={markProcessed}
            processing={processing}
          />
        ) : null}
      </div>
    </>
  )
}

export default DataReview
