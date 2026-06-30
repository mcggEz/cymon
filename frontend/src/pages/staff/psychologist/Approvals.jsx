import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'

const priorityTone = {
  'High Priority': 'bg-rose-100 text-rose-700',
  'Medium Priority': 'bg-amber-100 text-amber-700',
  'Low Priority': 'bg-sky-100 text-sky-700',
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function Approvals() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')

  const load = () => api.psychologist.approvals().then((d) => setReports(d.reports)).catch(() => {})
  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? reports.filter((r) => r.name.toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q))
    : reports

  const act = async (id, status) => {
    setBusyId(id)
    try {
      await api.psychologist.updateReport(id, { status })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <StaffHeader title="Approvals" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-rose-100/80 px-4 py-3 text-sm text-rose-800">
          <span className="font-bold">⚠ {reports.length} Report{reports.length === 1 ? '' : 's'} Pending Your Review!</span>
          <div className="mt-0.5 text-xs text-rose-700/80">
            These reports are ready for your final review and digital signature.
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search reports by student or type…"
          />
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              {q ? 'No reports match your search.' : 'Nothing pending review.'}
            </div>
          ) : null}
          {!loading && visible.map((r) => (
            <article key={r.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-purple-800">{r.name}</div>
                  <div className="text-sm text-slate-600">{r.type}</div>
                  <div className="text-xs text-slate-500">Submitted: {fmtDate(r.date)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone[r.priority]}`}>
                  {r.priority}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => act(r.id, 'approved')}
                  disabled={busyId === r.id}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {busyId === r.id ? 'Working…' : '✓ Approve & Sign'}
                </button>
                <button
                  onClick={() => act(r.id, 'revise_requested')}
                  disabled={busyId === r.id}
                  className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                >
                  ↩ Request Revision
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 text-center">
          <button className="rounded-full bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            Click to View More ▾
          </button>
        </div>
      </div>
    </>
  )
}

export default Approvals
