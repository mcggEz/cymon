import PageHeader from './PageHeader'

const StatCard = ({ value, label, sub }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="text-3xl font-bold text-purple-800">{value}</div>
    <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
    {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
  </div>
)

const Badge = ({ children, tone = 'purple' }) => {
  const tones = {
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

function MoodChart() {
  const points = [3.2, 3.8, 4.0, 3.5, 4.2, 4.6, 4.1]
  const max = 5
  const width = 320
  const height = 120
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / max) * height}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <path d={path} stroke="#7c3aed" strokeWidth="2.5" fill="none" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={height - (p / max) * height} r="3" fill="#7c3aed" />
      ))}
    </svg>
  )
}

function HomeProgress() {
  return (
    <>
      <PageHeader title="Good Day, Leo!" subtitle="Welcome to CyMon" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          2 new assessments assigned by Dr. Jinky are waiting.{' '}
          <a href="#" className="font-semibold underline">
            Complete them now →
          </a>
        </div>

        <section className="mt-5 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 p-5 text-white">
          <div className="text-sm font-medium opacity-90">
            Current developmental stage for Leo Cruz
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="purple">IEP Level 2 · Moderate Support Needs</Badge>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-full w-2/3 rounded-full bg-white" />
          </div>
          <div className="mt-1 text-xs opacity-80">66% to Level 3</div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard value="24" label="CBI Submissions" />
          <StatCard value="15" label="IEP Goals Met" />
          <StatCard value="Mar 15" label="Next Appointment" />
          <StatCard value="4.2" label="Avg Mood (7 days)" />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-3 text-sm font-semibold text-purple-800">
              7-Day Mood & Task Completion
            </div>
            <MoodChart />
          </div>
          <div className="rounded-2xl bg-purple-100 p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Next Appointment</div>
            <div className="mt-3 text-3xl font-bold text-purple-900">15</div>
            <div className="text-sm text-purple-800">Mar 2026 · 10:00 AM</div>
            <div className="mt-2 text-xs text-purple-700">
              GARS-3 Follow-up Assessment
              <br />
              Dr. Jinky C. Malabanan · ClearMind Clinic
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Clinic Updates</div>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="border-l-2 border-purple-400 pl-3">
                <div className="font-medium text-slate-800">New therapy schedule for March 2026</div>
                <div className="text-xs text-slate-500">Mar 5, 2026</div>
              </li>
              <li className="border-l-2 border-purple-400 pl-3">
                <div className="font-medium text-slate-800">Clinic closure: Mar 17</div>
                <div className="text-xs text-slate-500">Mar 2, 2026</div>
              </li>
              <li className="border-l-2 border-purple-400 pl-3">
                <div className="font-medium text-slate-800">Holiday closure: April 9 (Holy Week)</div>
                <div className="text-xs text-slate-500">Feb 28, 2026</div>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Latest Clinician Notes</div>
            <div className="mt-3 rounded-md bg-purple-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-purple-800">Dr. Jinky C. Malabanan · Mar 3, 2026</div>
              <p className="mt-1">
                Leo is showing strong progress in social communication. Continue reinforcing
                routine-based prompts at home.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomeProgress
