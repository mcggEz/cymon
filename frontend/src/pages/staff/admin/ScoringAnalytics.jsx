import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

const STATUS_TONE = {
  Mastered: 'bg-emerald-100 text-emerald-700',
  Developing: 'bg-amber-100 text-amber-700',
  'Needs Support': 'bg-rose-100 text-rose-700',
  'No Data': 'bg-slate-100 text-slate-600',
}

const Stat = ({ value, label }) => (
  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-slate-800">{value}</div>
    </div>
  </div>
)

function ScoringAnalytics() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

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
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Student Scoring Analytics" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.avgCafat ?? '—'} label="Avg. CAFAT Score" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.assessmentsThisMonth ?? '—'} label="Assessments This Month" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.needsSupport ?? '—'} label="Students Needing Support" />
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
              placeholder="Search student name…"
              className="flex-1"
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
                  {s}
                </option>
              ))}
            </select>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              Export CSV Report
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Student Name</th>
                  <th className="py-3 px-4 text-left">Behavioral Score</th>
                  <th className="py-3 px-4 text-left">GARS-3 Index</th>
                  <th className="py-3 px-4 text-left">CAFAT Score</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`s${i}`}>
                        <td colSpan={6} className="py-3 px-4">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-sm text-slate-500">
                      No students match your search.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  pageRows.map((r) => {
                    const isSelected = active && active.id === r.id
                    return (
                      <tr
                        key={r.id}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">{r.name}</td>
                        <td className="py-3 px-4">{r.beh ?? '—'}</td>
                        <td className="py-3 px-4">{r.gars ?? '—'}</td>
                        <td className="py-3 px-4">{r.cafat ?? '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_TONE[r.status] || STATUS_TONE['No Data']}`}>
                            {r.status}
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
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-purple-800">Details</div>
                <button onClick={() => setActive(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Student</dt>
                  <dd className="font-medium text-purple-800">{active.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Behavioral Score</dt>
                  <dd className="font-medium text-purple-800">{active.beh ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">GARS-3 Index</dt>
                  <dd className="font-medium text-purple-800">{active.gars ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">CAFAT Score</dt>
                  <dd className="font-medium text-purple-800">{active.cafat ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Status</dt>
                  <dd>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_TONE[active.status] || STATUS_TONE['No Data']}`}>
                      {active.status || '—'}
                    </span>
                  </dd>
                </div>
              </dl>

              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <section>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">SUMMARY OF FINDINGS</div>
                  <p className="mt-1">
                    {active.name} demonstrated an excellent grasp of numerical and spatial concepts during
                    testing, and followed multi-step instructions effortlessly.
                  </p>
                </section>
                <section>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">AREAS OF CONCERN</div>
                  <p className="mt-1">No significant behavioral concerns at this time.</p>
                </section>
                <section>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">RECOMMENDATIONS</div>
                  <p className="mt-1">
                    Recommend continuing the current mainstreaming plan without additional support hours.
                  </p>
                </section>
              </div>

              <div className="mt-5">
                <button className="w-full rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  Print Official Report
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

export default ScoringAnalytics
