import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const STATUS_META = {
  not_ready: { label: 'Needs More Support', tone: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  approaching: { label: 'Approaching Readiness', tone: 'bg-sky-100 text-sky-700', bar: 'bg-blue-500' },
  ready: { label: 'Ready for Transition', tone: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
}

function Mainstreaming() {
  const [students, setStudents] = useState([])
  useEffect(() => {
    let on = true
    api.psychologist.mainstreaming().then((d) => on && setStudents(d.students)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader title="Mainstreaming" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-100 px-4 py-3 text-sm text-purple-900">
          <div className="font-semibold">📈 Mainstreaming Readiness Tracker</div>
          <div className="text-xs text-purple-700">
            Monitor each student&apos;s progress toward transitioning to regular schooling based on
            accumulated assessment scores.
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {students.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              No mainstreaming assessments yet.
            </div>
          ) : null}
          {students.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.not_ready
            return (
            <article key={s.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.level}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <span>Mainstreaming Readiness Score</span>
                <span className="text-sm font-semibold text-slate-800">{s.score}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-purple-100">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${s.score}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  ✏ Update Assessment
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  📊 View Details
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

export default Mainstreaming
