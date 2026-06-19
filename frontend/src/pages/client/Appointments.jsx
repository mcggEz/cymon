import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

const SESSION_LABEL = {
  mmse: 'MMSE Assessment',
  cafat: 'CAFAT Assessment',
  gars: 'GARS Assessment',
  initial_assessment: 'Initial Assessment',
  follow_up: 'Follow-up Session',
  therapy: 'Therapy Session',
  parent_consultation: 'Parent Consultation',
}
const STATUS_LABEL = { scheduled: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled', no_show: 'Missed' }

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    api.client
      .appointments()
      .then((d) => {
        if (!on) return
        setAppointments(d.appointments)
        setClinic(d.clinic)
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const rows = appointments.map((a) => {
    const dt = new Date(a.starts_at)
    return {
      id: a.id,
      day: String(dt.getDate()),
      mon: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      title: SESSION_LABEL[a.session_type] || a.session_type,
      by: a.practitioner || '—',
      when: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      where: a.location || (clinic && clinic.name) || '',
      status: STATUS_LABEL[a.status] || a.status,
    }
  })

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
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="px-5 py-4">
                    <Skeleton className="h-14 w-full" rounded="rounded-2xl" />
                  </li>
                ))
              : null}
            {!loading && rows.length === 0 ? (
              <li className="px-5 py-4 text-sm text-slate-500">No appointments scheduled.</li>
            ) : null}
            {!loading
              ? rows.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-4">
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
                ))
              : null}
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border-2 border-dashed border-purple-300 bg-white p-6 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 text-purple-700">
            <span className="font-serif italic text-2xl font-semibold">ClearMind</span>
          </div>
          <div className="text-[10px] font-semibold tracking-[0.25em] text-purple-700/80">
            PSYCHOLOGICAL SERVICES
          </div>
          <p className="mt-3 text-sm text-slate-600">{clinic?.address}</p>
          <p className="text-sm text-slate-600">
            {[clinic?.email, clinic?.phone].filter(Boolean).join(' · ')}
          </p>
        </section>
      </div>
    </>
  )
}

export default Appointments
