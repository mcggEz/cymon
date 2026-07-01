import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
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

const COLOR_DOT = {
  purple: 'bg-purple-400',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const fieldCls = 'mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm'
const labelCls = 'text-xs font-semibold tracking-wider text-purple-700'

const shortName = (name) => {
  const parts = (name || '').split(' ').filter(Boolean)
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name
}
const timeOf = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const monOf = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()

function BookModal({ patients, practitioners, onClose, onBooked }) {
  const [f, setF] = useState({
    patient_id: '',
    practitioner_id: '',
    date: '',
    time: '',
    session_type: '',
    color_tag: 'purple',
    notes: '',
    location: '',
  })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const submit = async () => {
    setErr(null)
    if (!f.patient_id || !f.practitioner_id || !f.date || !f.time || !f.session_type) {
      setErr('Patient, practitioner, date, time, and session type are required.')
      return
    }
    setBusy(true)
    try {
      await api.admin.createAppointment(f)
      onBooked()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Book New Appointment"
      subtitle="Fill in all required fields to schedule a session"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {busy ? 'Booking…' : '📅 Book Appointment'}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className={labelCls}>STUDENT *</div>
          <select value={f.patient_id} onChange={(e) => set('patient_id', e.target.value)} className={fieldCls}>
            <option value="">Select…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={labelCls}>PRACTITIONER *</div>
          <select value={f.practitioner_id} onChange={(e) => set('practitioner_id', e.target.value)} className={fieldCls}>
            <option value="">Select…</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={labelCls}>DATE *</div>
          <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} className={fieldCls} />
        </div>
        <div>
          <div className={labelCls}>TIME *</div>
          <input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} className={fieldCls} />
        </div>
        <div>
          <div className={labelCls}>ASSESSMENT / SESSION TYPE *</div>
          <select value={f.session_type} onChange={(e) => set('session_type', e.target.value)} className={fieldCls}>
            <option value="">Select…</option>
            {Object.entries(SESSION_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className={labelCls}>LOCATION</div>
          <input
            value={f.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="ClearMind Clinic"
            className={fieldCls}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className={labelCls}>NOTES / SPECIAL INSTRUCTIONS</div>
        <textarea
          rows={3}
          value={f.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any additional notes…"
          className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4">
        <div className={labelCls}>COLOR TAG</div>
        <div className="mt-2 flex items-center gap-2">
          {Object.keys(COLOR_DOT).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('color_tag', c)}
              aria-label={`Color ${c}`}
              className={`h-7 w-7 rounded-full ${COLOR_DOT[c]} ${
                f.color_tag === c ? 'ring-2 ring-purple-500 ring-offset-2' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {err ? <div className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
    </Modal>
  )
}

function Schedule() {
  const [open, setOpen] = useState(false)
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })
  const [query, setQuery] = useState('')
  const [practFilter, setPractFilter] = useState('all')
  const [patients, setPatients] = useState([])
  const [staffList, setStaffList] = useState([])

  const focusMonth = (list) => {
    if (!list.length) return
    const earliest = list.map((a) => new Date(a.starts_at)).sort((a, b) => a - b)[0]
    setCursor({ y: earliest.getFullYear(), m: earliest.getMonth() })
  }

  useEffect(() => {
    let on = true
    Promise.all([api.admin.schedule(), api.admin.patients(), api.admin.employees()])
      .then(([s, p, e]) => {
        if (!on) return
        setAppts(s.appointments)
        focusMonth(s.appointments)
        setPatients((p.patients || []).map((x) => ({ id: x.id, name: x.name })))
        setStaffList(
          (e.employees || []).filter((x) => x.role !== 'admin').map((x) => ({ id: x.id, name: x.name }))
        )
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const onBooked = async () => {
    setOpen(false)
    const d = await api.admin.schedule().catch(() => null)
    if (d) {
      setAppts(d.appointments)
      focusMonth(d.appointments)
    }
  }

  const practitioners = [...new Set(appts.map((a) => a.practitioner).filter(Boolean))].sort()
  const q = query.trim().toLowerCase()
  const filtered = appts.filter((a) => {
    const mq = !q || (a.patient || '').toLowerCase().includes(q)
    const mp = practFilter === 'all' || a.practitioner === practFilter
    return mq && mp
  })

  const monthStart = new Date(cursor.y, cursor.m, 1)
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const offset = monthStart.getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
  const now = new Date()
  const todayDay = now.getFullYear() === cursor.y && now.getMonth() === cursor.m ? now.getDate() : null

  const eventsByDay = filtered.reduce((acc, a) => {
    const d = new Date(a.starts_at)
    if (d.getFullYear() !== cursor.y || d.getMonth() !== cursor.m) return acc
    const day = d.getDate()
    const ev = {
      id: a.id,
      tone: CAL_TONE[a.color_tag] || CAL_TONE.purple,
      title: `${timeOf(a.starts_at)} — ${shortName(a.patient)}`,
      sub: `${a.practitioner} · ${SESSION_LABEL[a.session_type] || a.session_type}`,
    }
    acc[day] = [...(acc[day] || []), ev]
    return acc
  }, {})

  const list = filtered
    .slice()
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      day: String(new Date(a.starts_at).getDate()),
      mon: monOf(a.starts_at),
      name: a.patient,
      detail: `${timeOf(a.starts_at)} · ${a.practitioner} (${SESSION_LABEL[a.session_type] || a.session_type})`,
    }))

  const shiftMonth = (delta) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  const goToday = () => {
    const n = new Date()
    setCursor({ y: n.getFullYear(), m: n.getMonth() })
  }

  return (
    <>
      <StaffHeader title="Clinic Master Schedule" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
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

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by patient name…"
              className="flex-1"
            />
            <select
              value={practFilter}
              onChange={(e) => setPractFilter(e.target.value)}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Practitioners</option>
              {practitioners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            {loading ? (
              <Skeleton className="h-72 w-full" rounded="rounded-2xl" />
            ) : (
              <>
                <div className="flex items-center justify-between text-purple-700">
                  <button
                    onClick={() => shiftMonth(-1)}
                    aria-label="Previous month"
                    className="rounded-md bg-purple-700 px-2 py-1 text-xs text-white hover:bg-purple-800"
                  >
                    ◀
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold">{monthLabel}</div>
                    <button
                      onClick={goToday}
                      className="rounded-md border border-purple-200 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700 hover:bg-purple-50"
                    >
                      TODAY
                    </button>
                  </div>
                  <button
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="rounded-md bg-purple-700 px-2 py-1 text-xs text-white hover:bg-purple-800"
                  >
                    ▶
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wider text-purple-700">
                  {WEEKDAYS.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`o${i}`} />
                  ))}
                  {days.map((d) => (
                    <div key={d} className="min-h-[78px] rounded-md border border-purple-100 p-1 text-[10px]">
                      <div
                        className={`mb-1 ${
                          d === todayDay
                            ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-700 text-white'
                            : 'text-slate-500'
                        }`}
                      >
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
              </>
            )}
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">📅 Appointments</div>
            {loading ? (
              <div className="mt-3">
                <SkeletonText lines={5} />
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {list.length === 0 ? (
                  <li className="text-sm text-slate-500">No appointments match your search.</li>
                ) : null}
                {list.map((u) => (
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
            )}
          </aside>
        </div>
      </div>

      {open ? (
        <BookModal
          patients={patients}
          practitioners={staffList}
          onClose={() => setOpen(false)}
          onBooked={onBooked}
        />
      ) : null}
    </>
  )
}

export default Schedule
