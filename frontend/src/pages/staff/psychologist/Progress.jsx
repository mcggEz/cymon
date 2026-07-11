import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import ProgressSummaryReportForm from './ProgressSummaryReportForm'
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
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)
  const [openForm, setOpenForm] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = () =>
    api.psychologist
      .progress()
      .then((d) => {
        setItems(d.items)
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
  const visible = q
    ? items.filter((i) => i.name.toLowerCase().includes(q) || (i.period || '').toLowerCase().includes(q))
    : items
  const paged = visible.slice(0, shown)

  return (
    <>
      <StaffHeader title="Monthly Summary Progress" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Progress Tracking</h1>
              <p className="text-sm text-slate-500">
                Monthly Progress Summary Reports (PSR - FO-08) analyzing student trajectory
              </p>
            </div>
            <button
              onClick={() => setOpenForm(true)}
              className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Open Progress Summary Report
            </button>
          </div>
          {notice ? (
            <div className="mt-3 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
          ) : null}
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

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Student</th>
                  <th className="py-3 text-left">Period</th>
                  <th className="py-3 text-left">Trend</th>
                  <th className="py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="py-3">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && visible.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                      {q ? 'No reports match your search.' : 'No progress reports yet.'}
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  paged.map((i) => {
                    const meta = STATUS_META[i.status] || STATUS_META.draft
                    const trendTone = i.trend && i.trend.toLowerCase().includes('improv') ? 'emerald' : 'amber'
                    return (
                      <tr key={i.id}>
                        <td className="py-3 font-medium text-purple-800">{i.name}</td>
                        <td className="py-3 text-slate-600">{i.period || '—'}</td>
                        <td className="py-3">
                          {i.trend ? (
                            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[trendTone]}`}>
                              {i.trend}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[meta.tone]}`}>
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

        {!loading && shown < visible.length ? (
          <div className="mt-5 text-center">
            <button
              onClick={() => setShown((s) => s + PAGE_SIZE)}
              className="rounded-full bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Click to View More
            </button>
          </div>
        ) : null}
      </div>

      {openForm ? (
        <ProgressSummaryReportForm
          patients={patients}
          onSaved={() => {
            setNotice('Progress report draft saved.')
            load()
          }}
          onClose={() => setOpenForm(false)}
        />
      ) : null}
    </>
  )
}

export default Progress
