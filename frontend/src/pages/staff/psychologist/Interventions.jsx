import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import { api } from '../../../lib/api'

const STATUS_META = {
  completed: { label: 'Completed', tone: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'In Progress', tone: 'bg-sky-100 text-sky-700' },
  planned: { label: 'Planned', tone: 'bg-amber-100 text-amber-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function Interventions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let on = true
    api.psychologist.interventions().then((d) => on && setItems(d.items)).catch(() => {}).finally(() => { if (on) setLoading(false) })
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader title="Interventions" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Master&apos;s Level Intervention</h1>
              <p className="text-sm text-slate-500">
                All assigned clients with current Support Level and milestone completion
              </p>
            </div>
            <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
              + New Report
            </button>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              No intervention plans yet.
            </div>
          ) : null}
          {!loading && items.map((i) => {
            const meta = STATUS_META[i.status] || STATUS_META.planned
            return (
            <article key={i.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.title} · {fmtDate(i.date)}</div>
                  <div className="mt-1 text-sm text-slate-700">{i.count} procedures documented</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  ✏ View / Edit
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  ⬇ Export
                </button>
              </div>
            </article>
            )
          })}
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

export default Interventions
