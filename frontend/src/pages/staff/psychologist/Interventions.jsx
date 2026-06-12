import StaffHeader from '../StaffHeader'

const ITEMS = [
  { name: 'Alex Johnson', date: '2026-03-28', count: 5, status: 'Completed', tone: 'emerald' },
  { name: 'Jordan Smith', date: '2026-03-27', count: 3, status: 'In Progress', tone: 'sky' },
  { name: 'Casey Williams', date: '2026-03-26', count: 4, status: 'Completed', tone: 'emerald' },
]

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  sky: 'bg-sky-100 text-sky-700',
}

function Interventions() {
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
          {ITEMS.map((i) => (
            <article key={i.name} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.date}</div>
                  <div className="mt-1 text-sm text-slate-700">{i.count} procedures documented</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[i.tone]}`}>
                  {i.status}
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

export default Interventions
