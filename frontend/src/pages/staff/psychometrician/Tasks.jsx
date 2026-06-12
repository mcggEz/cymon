import StaffHeader from '../StaffHeader'

const TASKS = [
  {
    name: 'Alex Johnson',
    meta: 'ID: 2026-042 · 7 yrs / M',
    detail: 'MMSE Assessment',
    room: 'Testing Room 1',
    time: '09:00 AM',
    status: 'SCHEDULED',
    action: 'Start Assessment →',
  },
  {
    name: 'Jordan Smith',
    meta: 'ID: 2026-088 · 9 yrs / M',
    detail: 'CAFAT Testing',
    room: 'Play Room A',
    time: '10:30 AM',
    status: 'SCHEDULED',
    action: 'Start Assessment →',
  },
  {
    name: 'Casey Williams',
    meta: 'ID: 2026-015 · 6 yrs / F',
    detail: 'Behavioral Observation',
    room: 'Sensory Room',
    time: '01:00 PM',
    status: 'COMPLETED',
    action: 'Draft Report 📝',
  },
]

const statusTone = {
  SCHEDULED: 'bg-sky-100 text-sky-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
}

function Tasks() {
  return (
    <>
      <StaffHeader title="Good Day, Dr. Erika!" subtitle="Welcome to CyMon" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 p-5 text-white">
          <div className="flex items-center gap-2 text-base font-semibold">
            <span>💡</span>
            Daily Clinical Reminders & Instructions
          </div>
          <ul className="mt-3 space-y-2 text-sm text-purple-50">
            <li>
              <span className="font-semibold">Pre-Assessment:</span> Ensure a quiet testing
              environment and establish rapport before initiating the MMSE (CMPS:SE-FO-04) or CAFAT
              (CMPS:SE-FO-05).
            </li>
            <li>
              <span className="font-semibold">Data Encoding:</span> Record all raw scores accurately
              during the session. Mark items as &quot;N/A&quot; rather than &quot;0&quot; if the
              child refused to answer due to behavioral non-compliance.
            </li>
            <li>
              <span className="font-semibold">Observations:</span> During the session, actively
              monitor and log any perceptual disturbances or stimming behaviors in the provided form
              sections.
            </li>
            <li>
              <span className="font-semibold">Post-Assessment:</span> Draft the Behavioral
              Assessment Report (CMPS:SE-FO-06) synthesizing today&apos;s scores and submit it to
              the Chief Psychologist for approval within 24 hours.
            </li>
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border-2 border-purple-300 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-purple-800">Today&apos;s Task List</h2>
            <div className="text-xs text-slate-500">1 of 3 Tasks Completed</div>
          </div>

          <ul className="mt-4 divide-y divide-purple-100">
            {TASKS.map((t) => (
              <li key={t.name} className="flex items-center gap-4 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-purple-800">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.meta}</div>
                  </div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    {t.detail}{' '}
                    <span className="ml-2 inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      📍 {t.room}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">{t.time}</div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[t.status]}`}>
                  {t.status}
                </span>
                <button
                  className={[
                    'rounded-md px-3 py-2 text-sm font-medium',
                    t.status === 'COMPLETED'
                      ? 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                      : 'bg-purple-700 text-white hover:bg-purple-800',
                  ].join(' ')}
                >
                  {t.action}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

export default Tasks
