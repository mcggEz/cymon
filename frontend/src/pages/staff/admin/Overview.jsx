import StaffHeader from '../StaffHeader'

const StatCard = ({ value, label, sub, tone, icon }) => {
  const tones = {
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  }
  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500">{label}</div>
          <div className="mt-1 text-4xl font-bold text-slate-800">{value}</div>
          {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const QuickAction = ({ icon, label }) => (
  <button className="flex items-center gap-2 rounded-md bg-purple-700 px-4 py-3 text-left text-sm font-medium text-white hover:bg-purple-800">
    <span>{icon}</span>
    <span>{label}</span>
  </button>
)

const ACTIVITY = [
  { dot: 'bg-emerald-500', title: 'SPED Waiver submitted by Caden Reyes', time: '8:42 AM · Processed by Admin' },
  { dot: 'bg-amber-500', title: 'Reminder sent to Maria Cruz for overdue FO-02', time: '8:15 AM · Auto-Flagged' },
  { dot: 'bg-sky-500', title: 'Announcement posted: World Down Syndrome Day', time: '10:00 AM · Published to Parent Portal' },
  { dot: 'bg-emerald-500', title: 'New admission form submitted: Lena Buenaventura', time: '9:30 AM · Pending review' },
  { dot: 'bg-rose-500', title: 'Mia Santos — SummerScape waiver still pending signature', time: '12:00 PM · Due Mar 29' },
]

function Overview() {
  return (
    <>
      <StaffHeader title="Dashboard Overview" subtitle="Monday, March 30, 2026 — Clinic Operations" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value="20" label="Total Active Students" sub="↑ +2 this month" tone="purple" icon="👥" />
          <StatCard value="12" label="Pending Admissions" sub="Awaiting processing" tone="amber" icon="⏳" />
          <StatCard value="8" label="Waivers Missing Signature" sub="Action required" tone="rose" icon="❗" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">⚡ Quick Actions</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <QuickAction icon="📋" label="New Student Admission" />
              <QuickAction icon="📅" label="View Master Schedule" />
              <QuickAction icon="🛡" label="Review Compliance Issues" />
              <QuickAction icon="📢" label="Post Announcement" />
            </div>
          </section>

          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Walk-in Forms & Waivers</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">SPED Waiver</div>
                <div className="text-xs text-slate-500">FO-02 Processing</div>
              </div>
              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">SummerScape</div>
                <div className="text-xs text-slate-500">FO-13 Enrollment</div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-purple-800">⏱ Recent Activity</div>
            <div className="text-xs text-slate-500">Today</div>
          </div>
          <ul className="mt-3 space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className={`mt-1.5 h-2 w-2 rounded-full ${a.dot}`} />
                <div>
                  <div className="text-slate-800">
                    {a.title.split(/(\*\*.*?\*\*)/).map((p, j) => (
                      <span key={j}>{p}</span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

export default Overview
