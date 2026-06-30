import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Modal from '../../../components/ui/Modal'
import { api } from '../../../lib/api'

const STATUS_TONE = {
  Mastered: 'bg-emerald-100 text-emerald-700',
  Developing: 'bg-amber-100 text-amber-700',
  'Needs Support': 'bg-rose-100 text-rose-700',
  'No Data': 'bg-slate-100 text-slate-600',
}

const Stat = ({ value, label, icon, color }) => (
  <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-slate-800">{value}</div>
    </div>
    <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color}`}>{icon}</div>
  </div>
)

function ReportModal({ row, onClose }) {
  return (
    <Modal
      title="Finalized Behavioral Assessment Report"
      subtitle={
        <>
          {row.name} · Approved Mar 30, 2026 ·{' '}
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Approved</span>
        </>
      }
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close Preview
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print Official Report
          </button>
        </div>
      }
    >
        <div className="space-y-4 text-sm text-slate-700">
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">SUMMARY OF FINDINGS</div>
            <p className="mt-1">
              {row.name} demonstrated an excellent grasp of numerical and spatial concepts during
              testing. He followed multi-step instructions effortlessly.
            </p>
          </section>
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">AREAS OF CONCERN</div>
            <p className="mt-1">No significant behavioral concerns at this time.</p>
          </section>
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">RECOMMENDATIONS</div>
            <p className="mt-1">
              Recommend continuing the current mainstreaming plan without additional support hours.
            </p>
          </section>
        </div>
    </Modal>
  )
}

function ScoringAnalytics() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let on = true
    api.admin
      .scoring()
      .then((d) => {
        if (!on) return
        setRows(d.rows)
        setSummary(d.summary)
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const statuses = [...new Set(rows.map((r) => r.status).filter(Boolean))]
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || (r.name || '').toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })

  return (
    <>
      <StaffHeader title="Student Scoring Analytics" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.avgCafat ?? '—'} label="Avg. CAFAT Score" icon="📝" color="bg-purple-100 text-purple-700" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.assessmentsThisMonth ?? '—'} label="Assessments This Month" icon="📋" color="bg-emerald-100 text-emerald-700" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.needsSupport ?? '—'} label="Students Needing Support" icon="⚠" color="bg-amber-100 text-amber-700" />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search student name…"
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              ⬇ Export CSV Report
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Student</th>
                  <th className="py-3 text-left">Behavioral Score</th>
                  <th className="py-3 text-left">GARS-3 Index</th>
                  <th className="py-3 text-left">CAFAT Score</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`s${i}`}>
                        <td colSpan={6} className="py-3">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                      No students match your search.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium text-slate-800">{r.name}</td>
                    <td className="py-3">{r.beh ?? '—'}</td>
                    <td className="py-3">{r.gars ?? '—'}</td>
                    <td className="py-3">{r.cafat ?? '—'}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_TONE[r.status] || STATUS_TONE['No Data']}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <RowAction variant="view" onClick={() => setActive(r)}>
                        📝 Report
                      </RowAction>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {active ? <ReportModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default ScoringAnalytics
