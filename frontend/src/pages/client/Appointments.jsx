import PageHeader from './PageHeader'

const UPCOMING = [
  {
    day: '15',
    mon: 'MAR',
    title: 'GARS-3 Follow-up Assessment',
    by: 'Dr. Jinky C. Malabanan',
    when: '9:00 AM',
    where: 'ClearMind Clinic',
    status: 'Upcoming',
  },
  {
    day: '29',
    mon: 'MAR',
    title: 'Therapy Review Session',
    by: 'Dr. Jinky C. Malabanan',
    when: '10:00 AM',
    where: 'ClearMind Clinic',
    status: 'Upcoming',
  },
]

function Appointments() {
  return (
    <>
      <PageHeader title="Appointments" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Leo&apos;s upcoming appointments at ClearMind Psychological Services.
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white shadow-sm">
          <header className="flex items-center gap-2 border-b border-purple-100 bg-amber-50 px-5 py-3">
            <span className="text-amber-600">⚑</span>
            <div className="text-sm font-semibold text-amber-800">Upcoming Appointments</div>
          </header>
          <ul className="divide-y divide-purple-100">
            {UPCOMING.map((a) => (
              <li key={a.title} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                  <div className="text-lg font-bold leading-none">{a.day}</div>
                  <div className="text-[10px] font-semibold tracking-wider">{a.mon}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-800">{a.title}</div>
                  <div className="text-xs text-slate-500">
                    By {a.by} · {a.when} · {a.where}
                  </div>
                </div>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border-2 border-dashed border-purple-300 bg-white p-6 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 text-purple-700">
            <span className="font-serif italic text-2xl font-semibold">ClearMind</span>
          </div>
          <div className="text-[10px] font-semibold tracking-[0.25em] text-purple-700/80">
            PSYCHOLOGICAL SERVICES
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Blk 1 Lot 7 Painsville Subdivision, Brgy. Banilo, Calauan City, Laguna 4025
          </p>
          <p className="text-sm text-slate-600">
            clearmind.psychservices@gmail.com · +63 992-918-4078
          </p>
        </section>
      </div>
    </>
  )
}

export default Appointments
