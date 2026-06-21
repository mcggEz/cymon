import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
}
const STATUS_META = {
  approved: { label: 'Approved', tone: 'sky' },
  ready_for_review: { label: 'Ready', tone: 'sky' },
  draft: { label: 'Draft', tone: 'amber' },
  in_progress: { label: 'In Progress', tone: 'amber' },
}

const PAGE_SIZE = 5

function Progress() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)
  useEffect(() => {
    let on = true
    api.psychologist.progress().then((d) => on && setItems(d.items)).catch(() => {}).finally(() => { if (on) setLoading(false) })
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? items.filter((i) => i.name.toLowerCase().includes(q) || (i.period || '').toLowerCase().includes(q))
    : items
  const paged = visible.slice(0, shown)

  return (
    <>
      <StaffHeader title="Progress" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Progress Tracking</h1>
              <p className="text-sm text-slate-500">
                Monthly Progress Summary Reports (PSR - FO-08) analyzing student trajectory
              </p>
            </div>
            <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
              + Generate Report
            </button>
          </div>
          <div className="mt-4">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setShown(PAGE_SIZE)
              }}
              placeholder="Search reports by student or period…"
            />
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              {q ? 'No reports match your search.' : 'No progress reports yet.'}
            </div>
          ) : null}
          {!loading && paged.map((i) => {
            const meta = STATUS_META[i.status] || STATUS_META.draft
            const trendTone = i.trend && i.trend.includes('↑') ? 'emerald' : 'amber'
            return (
            <article key={i.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.period}</div>
                </div>
                <div className="flex items-center gap-2">
                  {i.trend ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[trendTone]}`}>
                      {i.trend}
                    </span>
                  ) : null}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[meta.tone]}`}>
                    {meta.label}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  ✏ View
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  📊 Analytics
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  ⬇ Export
                </button>
              </div>
            </article>
            )
          })}
        </div>

        {!loading && shown < visible.length ? (
          <div className="mt-5 text-center">
            <button
              onClick={() => setShown((s) => s + PAGE_SIZE)}
              className="rounded-full bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Click to View More ▾
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}

export default Progress
