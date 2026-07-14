import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Pagination from '../../../components/ui/Pagination'
import RowAction from '../../../components/ui/RowAction'
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

const PAGE_SIZE = 20

function Progress() {
  const [active, setActive] = useState(null)
  const [items, setItems] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
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
  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Monthly Summary Progress" />
      <div className="flex-1 overflow-y-auto p-6">
        {notice ? (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
        ) : null}

        <div className="flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
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
          <div className="mt-4">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search reports by student or period…"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Period</th>
                  <th className="py-3 px-4 text-left">Trend</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3 px-4">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-slate-500">
                      {q ? 'No reports match your search.' : 'No progress reports yet.'}
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  paged.map((i) => {
                    const meta = STATUS_META[i.status] || STATUS_META.draft
                    const trendTone = i.trend && i.trend.toLowerCase().includes('improv') ? 'emerald' : 'amber'
                    const isSelected = active && active.id === i.id
                    return (
                      <tr
                        key={i.id}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4 font-medium text-purple-800">{i.name}</td>
                        <td className="py-3 px-4 text-slate-600">{i.period || '—'}</td>
                        <td className="py-3 px-4">
                          {i.trend ? (
                            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[trendTone]}`}>
                              {i.trend}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[meta.tone]}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <RowAction variant="view" onClick={() => setActive(i)}>
                            View
                          </RowAction>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={visible.length} onPage={setPage} />
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
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Student</div>
                  <div className="font-medium text-purple-800">{active.name || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Period</div>
                  <div className="font-medium text-purple-800">{active.period || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Trend</div>
                  <div className="font-medium text-purple-800">{active.trend || '—'}</div>
                </div>
              </dl>
              <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => setOpenForm('viewProgress')}
                  className="w-full rounded-md border border-purple-300 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
                >
                  View as Form
                </button>
              </div>
            </aside>
          </>
        ) : null}
        </div>
      </div>

      {openForm === true ? (
        <ProgressSummaryReportForm
          patients={patients}
          onSaved={() => {
            setNotice('Progress report draft saved.')
            load()
          }}
          onClose={() => setOpenForm(false)}
        />
      ) : null}
      {openForm === 'viewProgress' ? (
        <ProgressSummaryReportForm
          patients={patients}
          detail={active}
          readOnly={true}
          onClose={() => setOpenForm(false)}
        />
      ) : null}
    </>
  )
}

export default Progress
