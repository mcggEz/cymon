import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const priorityTone = {
  'High Priority': 'bg-rose-100 text-rose-700',
  'Medium Priority': 'bg-amber-100 text-amber-700',
  'Low Priority': 'bg-sky-100 text-sky-700',
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function Approvals() {
  const [reports, setReports] = useState([])
  useEffect(() => {
    let on = true
    api.psychologist.approvals().then((d) => on && setReports(d.reports)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

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

        <div className="mt-5 flex flex-col gap-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              Nothing pending review.
            </div>
          ) : null}
          {reports.map((r) => (
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
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  👁 Review & Sign
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  ⬇ Generate PDF
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
