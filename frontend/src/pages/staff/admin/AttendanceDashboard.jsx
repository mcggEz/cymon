import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import AttendanceSessionForm from './AttendanceSessionForm'
import { api } from '../../../lib/api'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function AttendanceDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [query, setQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })

  const loadStats = () =>
    api.admin
      .attendanceStats()
      .then(setStats)
      .catch(() => {})

  useEffect(() => {
    let on = true
    setLoading(true)
    loadStats().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const monthStart = new Date(cursor.y, cursor.m, 1)
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const offset = monthStart.getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
  const now = new Date()
  const todayDay = now.getFullYear() === cursor.y && now.getMonth() === cursor.m ? now.getDate() : null

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

  // Filter logs for each day
  const getLogsForDay = (d) => {
    const dateStr = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const list = stats?.recentLogs || []
    const q = query.trim().toLowerCase()
    return list.filter((row) => {
      const matchesDate = row.date === dateStr
      const matchesQuery = !q || (row.studentName || '').toLowerCase().includes(q)
      return matchesDate && matchesQuery
    })
  }

  // Get active list for selected calendar day
  const selectedDayLogs = getLogsForDay(selectedDay)

  return (
    <>
      <StaffHeader title="Attendance Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">Attendance Statistics & Dashboard</h1>
          <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
            Monitor program attendance metrics, student session records, and monthly FO-11 logs.
          </div>
        </div>

        {/* Attendance & Session Record Launcher */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-purple-900">Attendance & Session Record (FO-11)</h2>
            <p className="text-xs text-purple-700 mt-1">
              Access, complete, or review the official monthly attendance sheets, rubrics, and clinical session records.
            </p>
          </div>
          <button
            onClick={() => setSelectedStudent({ patientId: null, patientName: '', program: '' })}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Log Attendance (FO-11)
          </button>
        </div>

        {/* Filters section */}
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="max-w-xs">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by student name…"
              className="w-full"
            />
          </div>
        </section>

        {/* Main Grid Calendar & Sidebar layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          
          {/* Left panel: Calendar Grid */}
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            {loading ? (
              <Skeleton className="h-[450px] w-full" rounded="rounded-2xl" />
            ) : (
              <>
                <div className="flex items-center justify-between text-purple-700 mb-4">
                  <button
                    onClick={() => shiftMonth(-1)}
                    className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 cursor-pointer"
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
                    className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 cursor-pointer"
                  >
                    Next
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wider text-purple-700 border-b border-purple-100 pb-2">
                  {WEEKDAYS.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`o${i}`} />
                  ))}
                  {days.map((d) => {
                    const isSelected = selectedDay === d
                    const dayLogs = getLogsForDay(d)

                    return (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`min-h-[90px] w-full text-left flex flex-col justify-start items-stretch rounded-md border p-1.5 text-[10px] transition-all hover:bg-purple-50/50 cursor-pointer ${
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
                              ? 'text-purple-700 font-extrabold'
                              : 'text-slate-500'
                          }`}
                        >
                          {d}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                          {dayLogs.map((e) => (
                            <div
                              key={e.id}
                              className={`rounded px-1 py-0.5 truncate text-[8px] font-semibold tracking-wide ${
                                e.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border-l border-emerald-500' :
                                e.status === 'Absent' ? 'bg-rose-100 text-rose-800 border-l border-rose-500' :
                                'bg-amber-100 text-amber-800 border-l border-amber-500'
                              }`}
                            >
                              {e.studentName.split(' ')[0]} ({e.status[0]})
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          {/* Right panel: Sidebar detail for selected day */}
          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm flex flex-col h-[560px]">
            <h3 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0 flex items-center justify-between">
              <span>Attendance Log</span>
              <span className="text-xs font-normal text-slate-500">
                {monthLabel.split(' ')[0]} {selectedDay}
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {loading ? (
                <SkeletonText lines={6} />
              ) : selectedDayLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="font-semibold">No logs recorded</p>
                  <p className="text-[10px] mt-0.5">for this date</p>
                </div>
              ) : (
                selectedDayLogs.map((e) => (
                  <div
                    key={e.id}
                    className="border border-purple-100 rounded-xl p-3 bg-purple-50/20 hover:bg-purple-50/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-purple-800">{e.studentName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            e.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                            e.status === 'Absent' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{e.program}</div>
                      {e.status === 'Present' && (e.timeIn || e.timeOut) && (
                        <div className="text-[10px] text-slate-600 mt-1 font-medium">
                          🕒 {e.timeIn || '—'} - {e.timeOut || '—'}
                        </div>
                      )}
                      {e.remarks && (
                        <div className="text-[10px] text-slate-600 mt-1.5 italic border-t border-purple-100/50 pt-1">
                          "{e.remarks}"
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setSelectedStudent({
                          patientId: e.patientId,
                          patientName: e.studentName,
                          program: e.program
                        })}
                        className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                      >
                        View / Edit FO-11
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

        </div>

      </div>

      {selectedStudent && (
        <AttendanceSessionForm
          patientId={selectedStudent.patientId}
          patientName={selectedStudent.patientName}
          program={selectedStudent.program}
          date={`${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`}
          onClose={() => {
            setSelectedStudent(null)
            loadStats()
          }}
        />
      )}
    </>
  )
}

export default AttendanceDashboard
