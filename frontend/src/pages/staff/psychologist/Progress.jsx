import StaffHeader from '../StaffHeader'

const ITEMS = [
  { name: 'Alex Johnson', period: 'March 2026', trend: '↑ Improving', trendTone: 'emerald', status: 'Ready', statusTone: 'sky' },
  { name: 'Jordan Smith', period: 'March 2026', trend: '→ Stable', trendTone: 'amber', status: 'Draft', statusTone: 'amber' },
  { name: 'Casey Williams', period: 'February 2026', trend: '↑ Improving', trendTone: 'emerald', status: 'Ready', statusTone: 'sky' },
]

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
}

function Progress() {
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
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {ITEMS.map((i) => (
            <article key={i.name} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.period}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[i.trendTone]}`}>
                    {i.trend}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[i.statusTone]}`}>
                    {i.status}
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

export default Progress
