import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

const UPCOMING = [
  { day: '30', mon: 'MAR', name: 'Zara Mendoza', detail: '10:00 AM · Dr. Faustino (CAFAT)' },
  { day: '31', mon: 'MAR', name: 'Carlos Bautista', detail: '9:30 AM · Dr. Malabanan (Follow-up Session)' },
  { day: '3', mon: 'APR', name: 'Leo Cruz', detail: '11:00 AM · Dr. Faustino (GARS)' },
  { day: '7', mon: 'APR', name: 'Mia Santos', detail: '1:30 PM · Dr. Malabanan (Therapy Session)' },
  { day: '10', mon: 'APR', name: 'Alex Jimenez', detail: '2:00 PM · Dr. Faustino (MMSE)' },
]

const EVENTS = [
  { day: 3, tone: 'bg-sky-100 text-sky-800', title: '9:00 AM — A. Jimenez', sub: 'Dr. Faustino · MMSE' },
  { day: 5, tone: 'bg-rose-100 text-rose-800', title: '1:00 PM — C. Williams', sub: 'Dr. Malabanan (Follow-up Session)' },
  { day: 10, tone: 'bg-purple-100 text-purple-800', title: '11:30 AM — B. Santos', sub: 'Dr. Faustino · CAFAT' },
  { day: 15, tone: 'bg-emerald-100 text-emerald-800', title: '9:00 AM — L. Cruz', sub: 'Dr. Malabanan · GARS' },
  { day: 18, tone: 'bg-amber-100 text-amber-800', title: '2:00 PM — M. Santos', sub: 'Dr. Faustino (Therapy Session)' },
  { day: 24, tone: 'bg-sky-100 text-sky-800', title: '9:00 AM — N. Aquino', sub: 'Dr. Malabanan (Initial Assessment)' },
  { day: 30, tone: 'bg-purple-100 text-purple-800', title: '10:00 AM — Z. Mendoza', sub: 'Dr. Faustino (CAFAT)' },
  { day: 31, tone: 'bg-sky-100 text-sky-800', title: '9:30 AM — C. Bautista', sub: 'Dr. Malabanan (Follow-up)' },
]

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
  const navigate = useNavigate()
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const offset = 0
  const eventsByDay = EVENTS.reduce((acc, e) => {
    acc[e.day] = [...(acc[e.day] || []), e]
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
                  {(eventsByDay[d] || []).map((e, i) => (
                    <div key={i} className={`mt-1 rounded px-1 py-0.5 ${e.tone}`}>
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
              {UPCOMING.map((u) => (
                <li key={u.name} className="flex items-start gap-3">
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
