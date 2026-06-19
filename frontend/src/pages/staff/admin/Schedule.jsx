import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const SESSION_LABEL = {
  mmse: 'MMSE',
  cafat: 'CAFAT',
  gars: 'GARS',
  initial_assessment: 'Initial Assessment',
  follow_up: 'Follow-up Session',
  therapy: 'Therapy Session',
  parent_consultation: 'Parent Consultation',
}

const CAL_TONE = {
  purple: 'bg-purple-100 text-purple-800',
  sky: 'bg-sky-100 text-sky-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-800',
}

const shortName = (name) => {
  const parts = (name || '').split(' ').filter(Boolean)
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name
}
const timeOf = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const monOf = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()

function BookModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-purple-800">Book New Appointment</div>
            <div className="text-xs text-slate-500">Fill in all required fields to schedule a session</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">STUDENT NAME *</div>
            <input placeholder="Full name" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">STUDENT ID</div>
            <input placeholder="e.g. STU-0001" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">DATE *</div>
            <input type="date" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">TIME *</div>
            <input type="time" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">PRACTITIONER *</div>
            <select className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm">
              <option>Select…</option>
              <option>Dr. Faustino</option>
              <option>Dr. Malabanan</option>
              <option>Dr. Reyes</option>
              <option>Dr. Garcia</option>
            </select>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">ASSESSMENT / SESSION TYPE *</div>
            <select className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm">
              <option>Select…</option>
              <option>MMSE</option>
              <option>CAFAT</option>
              <option>GARS</option>
              <option>Initial Assessment</option>
              <option>Follow-up Session</option>
              <option>Therapy Session</option>
              <option>Parent Consultation</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold tracking-wider text-purple-700">NOTES / SPECIAL INSTRUCTIONS</div>
          <textarea
            rows={3}
            placeholder="Any additional notes…"
            className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold tracking-wider text-purple-700">COLOR TAG</div>
          <div className="mt-2 flex items-center gap-2">
            {['bg-purple-400', 'bg-sky-400', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((c) => (
              <button key={c} className={`h-7 w-7 rounded-full ${c}`} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
            Cancel
          </button>
          <button onClick={onClose} className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            📅 Book Appointment
          </button>
        </div>
      </div>
    </div>
  )
}

function Schedule() {
  const [open, setOpen] = useState(false)
  const [appts, setAppts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let on = true
    api.admin.schedule().then((d) => on && setAppts(d.appointments)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const offset = 0
  const upcoming = appts.map((a) => ({
    id: a.id,
    day: String(new Date(a.starts_at).getDate()),
    mon: monOf(a.starts_at),
    name: a.patient,
    detail: `${timeOf(a.starts_at)} · ${a.practitioner} (${SESSION_LABEL[a.session_type] || a.session_type})`,
  }))
  const eventsByDay = appts.reduce((acc, a) => {
    const day = new Date(a.starts_at).getDate()
    const ev = {
      id: a.id,
      tone: CAL_TONE[a.color_tag] || CAL_TONE.purple,
      title: `${timeOf(a.starts_at)} — ${shortName(a.patient)}`,
      sub: `${a.practitioner} · ${SESSION_LABEL[a.session_type] || a.session_type}`,
    }
    acc[day] = [...(acc[day] || []), ev]
    return acc
  }, {})

  return (
    <>
      <StaffHeader title="Clinic Master Schedule" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          ← Back to Overview
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-purple-800">Clinic Master Schedule</h1>
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            + Add Appointment
          </button>
        </div>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Appointments and sessions for all practitioners
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-purple-700">
              <button className="rounded-md bg-purple-700 px-2 py-1 text-xs text-white">◀</button>
              <div className="text-lg font-bold">MARCH</div>
              <button className="rounded-md bg-purple-700 px-2 py-1 text-xs text-white">▶</button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wider text-purple-700">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`o${i}`} />
              ))}
              {days.map((d) => (
                <div key={d} className="min-h-[78px] rounded-md border border-purple-100 p-1 text-[10px]">
                  <div className={`mb-1 ${d === 30 ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-white' : 'text-slate-500'}`}>
                    {d}
                  </div>
                  {(eventsByDay[d] || []).map((e) => (
                    <div key={e.id} className={`mt-1 rounded px-1 py-0.5 ${e.tone}`}>
                      <div className="truncate text-[9px] font-semibold">{e.title}</div>
                      <div className="truncate text-[9px] opacity-80">{e.sub}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">📅 Upcoming</div>
            <ul className="mt-3 space-y-3">
              {upcoming.map((u) => (
                <li key={u.id} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-purple-100 text-purple-800">
                    <div className="text-sm font-bold leading-none">{u.day}</div>
                    <div className="text-[9px] font-semibold tracking-wider">{u.mon}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-800">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      {open ? <BookModal onClose={() => setOpen(false)} /> : null}
    </>
  )
}

export default Schedule
