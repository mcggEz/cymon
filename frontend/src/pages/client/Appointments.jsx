import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
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

const STATUS_LABEL = {
  scheduled: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'Missed',
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CAL_TONE = {
  purple: 'bg-purple-50 text-purple-700 border border-purple-100',
  blue: 'bg-blue-50 text-blue-700 border border-blue-100',
  green: 'bg-green-50 text-green-700 border border-green-100',
  orange: 'bg-orange-50 text-orange-700 border border-orange-100',
  red: 'bg-red-50 text-red-700 border border-red-100',
}

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())

  const focusMonth = (list) => {
    if (!list.length) return
    const earliest = list.map((a) => new Date(a.starts_at)).sort((a, b) => a - b)[0]
    setCursor({ y: earliest.getFullYear(), m: earliest.getMonth() })
  }

  useEffect(() => {
    let on = true
    api.client
      .appointments()
      .then((d) => {
        if (!on) return
        setAppointments(d.appointments || [])
        setClinic(d.clinic)
        focusMonth(d.appointments || [])
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const filtered = appointments

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
      title: `${timeOf(a.starts_at)} — ${SESSION_LABEL[a.session_type] || a.session_type}`,
      sub: a.practitioner || '—',
    }
    acc[day] = [...(acc[day] || []), ev]
    return acc
  }, {})

  const list = filtered
    .filter((a) => {
      const date = new Date(a.starts_at)
      return date.getFullYear() === cursor.y && date.getMonth() === cursor.m && date.getDate() === selectedDay
    })
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .map((a) => ({
      id: a.id,
      time: timeOf(a.starts_at),
      title: SESSION_LABEL[a.session_type] || a.session_type,
      practitioner: a.practitioner || '—',
      status: STATUS_LABEL[a.status] || a.status,
      location: a.location || (clinic && clinic.name) || '',
      notes: a.notes,
    }))

  const shiftMonth = (delta) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      setSelectedDay(1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const goToday = () => {
    const n = new Date()
    setCursor({ y: n.getFullYear(), m: n.getMonth() })
    setSelectedDay(n.getDate())
  }

  return (
    <>
      <PageHeader title="Appointments" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-purple-800">My Appointments Schedule</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date:</label>
              <input
                type="date"
                onChange={(e) => {
                  if (!e.target.value) return
                  const parts = e.target.value.split('-')
                  if (parts.length === 3) {
                    const y = parseInt(parts[0], 10)
                    const m = parseInt(parts[1], 10) - 1
                    const d = parseInt(parts[2], 10)
                    setCursor({ y, m })
                    setSelectedDay(d)
                  }
                }}
                value={`${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`}
                className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Leo&apos;s upcoming appointments at ClearMind Psychological Services.
        </div>

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
                    className="rounded-md bg-purple-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-800 cursor-pointer"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold">{monthLabel}</div>
                    <button
                      onClick={goToday}
                      className="rounded-md border border-purple-200 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700 hover:bg-purple-50 cursor-pointer"
                    >
                      TODAY
                    </button>
                  </div>
                  <button
                    onClick={() => shiftMonth(1)}
                    aria-label="Next month"
                    className="rounded-md bg-purple-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-800 cursor-pointer"
                  >
                    Next
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
                  {days.map((d) => {
                    const isSelected = selectedDay === d
                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`min-h-[78px] w-full text-left flex flex-col justify-start items-stretch rounded-md border p-1.5 text-[10px] transition-all hover:bg-purple-50/50 cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 shadow-sm ring-1 ring-purple-600'
                            : 'border-purple-100 bg-white'
                        }`}
                      >
                        <div
                          className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            d === todayDay
                              ? 'bg-purple-700 text-white'
                              : isSelected
                              ? 'text-purple-700'
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
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">
              Schedule: {monthLabel.split(' ')[0]} {selectedDay}
            </div>
            {loading ? (
              <div className="mt-3">
                <SkeletonText lines={5} />
              </div>
            ) : (
              <div className="mt-4">
                {list.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="font-medium">No sessions scheduled</p>
                    <p className="text-[10px] mt-0.5">for this day</p>
                  </div>
                ) : (
                  <div className="relative border-l border-purple-100 pl-4 space-y-5">
                    {list.map((u) => (
                      <div key={u.id} className="relative">
                        <span className="absolute -left-[21px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-purple-500 ring-4 ring-white" />
                        <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center justify-between gap-1">
                          <span>{u.time}</span>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[8px] font-semibold text-purple-700 capitalize">
                            {u.status}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                          {u.title}
                        </div>
                        <div className="text-xs text-slate-500 leading-normal">
                          Practitioner: {u.practitioner}
                        </div>
                        {u.location ? (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                            📍 {u.location}
                          </div>
                        ) : null}
                        {u.notes ? (
                          <p className="mt-2 text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            Note: {u.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}

export default Appointments
