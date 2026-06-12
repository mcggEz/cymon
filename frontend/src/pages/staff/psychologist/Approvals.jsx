import StaffHeader from '../StaffHeader'

const REPORTS = [
  { name: 'Alex Johnson', type: 'Behavioral Assessment Report (FO-06)', date: '2026-03-28', priority: 'High Priority' },
  { name: 'Jordan Smith', type: 'Behavioral Assessment Report (FO-06)', date: '2026-03-27', priority: 'Medium Priority' },
  { name: 'Casey Williams', type: 'Behavioral Assessment Report (FO-06)', date: '2026-03-26', priority: 'Medium Priority' },
]

const priorityTone = {
  'High Priority': 'bg-rose-100 text-rose-700',
  'Medium Priority': 'bg-amber-100 text-amber-700',
}

function Approvals() {
  return (
    <>
      <StaffHeader title="Approvals" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-rose-100/80 px-4 py-3 text-sm text-rose-800">
          <span className="font-bold">⚠ 3 Reports Pending Your Review!</span>
          <div className="mt-0.5 text-xs text-rose-700/80">
            These Behavioral Assessment Reports are ready for your final review and digital signature.
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {REPORTS.map((r) => (
            <article key={r.name} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-purple-800">{r.name}</div>
                  <div className="text-sm text-slate-600">{r.type}</div>
                  <div className="text-xs text-slate-500">Submitted: {r.date}</div>
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
