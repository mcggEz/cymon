import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import DailyActivityReportForm from './DailyActivityReportForm'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'

const STATUS_META = {
  draft: { label: 'Draft', tone: 'bg-amber-100 text-amber-700 hover:bg-amber-200/60' },
  pending: { label: 'Pending', tone: 'bg-sky-100 text-sky-700 hover:bg-sky-200/60' },
  approved: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200/60' },
}

const formatLocalDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMonday = (d) => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(date.setDate(diff))
  mon.setHours(0, 0, 0, 0)
  return mon
}

const getWeekDays = (start) => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function ActivityLog() {
  const [active, setActive] = useState(null)
  const [openForm, setOpenForm] = useState(null)
  const [rows, setRows] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [query, setQuery] = useState('')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [formPrefill, setFormPrefill] = useState({ patientId: '', dateStr: '' })

  const load = () =>
    api.psychometrician
      .activityLogs()
      .then((d) => {
        setRows(d.rows || [])
        setPatients(d.patients || [])
        if (d.patients && d.patients.length > 0 && !selectedPatientId) {
          setSelectedPatientId(d.patients[0].id)
        }
      })
      .catch(() => {})

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const prevWeek = () => {
    const nextStart = new Date(weekStart)
    nextStart.setDate(weekStart.getDate() - 7)
    setWeekStart(nextStart)
  }

  const nextWeek = () => {
    const nextStart = new Date(weekStart)
    nextStart.setDate(weekStart.getDate() + 7)
    setWeekStart(nextStart)
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const patientLogs = rows.filter((r) => r.patient_id === selectedPatientId)
  const weekDays = getWeekDays(weekStart)

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const handleOpenAddForm = (dateStr) => {
    setFormPrefill({ patientId: selectedPatientId, dateStr })
    setOpenForm('dailyActivity')
  }

  const handleOpenEdit = (log) => {
    setActive(log)
    setOpenForm('viewActivity')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StaffHeader title="Daily Activity Report Logs" />
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
            
            {/* Left Panel: Students List */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-full flex flex-col overflow-hidden">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Enrolled Students
              </h2>
              <div className="mt-3 shrink-0">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search students…"
                  className="w-full"
                />
              </div>
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
                {loading ? (
                  <SkeletonText lines={10} />
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    No students found.
                  </div>
                ) : (
                  filteredPatients.map((p) => {
                    const isActive = selectedPatientId === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isActive ? 'border-purple-300 bg-purple-100 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm ${isActive ? 'text-purple-900' : 'text-slate-800'}`}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {p.patient_id || 'N/A'}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Daily Logs Dashboard */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              {selectedPatient ? (
                <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Track daily therapy log submissions, review draft entries, and submit behavioral indicators.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAddForm(formatLocalDate(new Date()))}
                        className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
                      >
                        + New Activity Report
                      </button>
                    </div>
                  </div>

                  {/* Student History Logs list */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
                      Session History Log
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                            <th className="py-2.5 px-3 text-left">Session</th>
                            <th className="py-2.5 px-3 text-left">Date</th>
                            <th className="py-2.5 px-3 text-left">Activity / Domain</th>
                            <th className="py-2.5 px-3 text-left">Status</th>
                            <th className="py-2.5 px-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {patientLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                No session logs recorded for this student yet.
                              </td>
                            </tr>
                          ) : (
                            patientLogs.map((log) => {
                              const meta = STATUS_META[log.status] || STATUS_META.draft
                              return (
                                <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3 px-3 text-slate-800 font-semibold">
                                    {log.session_number ? `#${log.session_number}` : '—'}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 text-xs">
                                    {new Date(log.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-purple-800 text-xs">{log.detail}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{log.target_domain || '—'}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tone.split(' ')[0]} ${meta.tone.split(' ')[1]}`}>
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <RowAction variant="view" onClick={() => handleOpenEdit(log)}>
                                      Open
                                    </RowAction>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-purple-200 p-12 text-center text-slate-500 bg-white h-full flex flex-col items-center justify-center">
                  Please select a student from the list to view or log daily activity reports.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {openForm === 'dailyActivity' ? (
          <DailyActivityReportForm
            patients={patients}
            initialPatientId={formPrefill.patientId}
            initialDate={formPrefill.dateStr}
            onSaved={load}
            onClose={() => setOpenForm(null)}
          />
        ) : null}
        {openForm === 'viewActivity' ? (
          <DailyActivityReportForm
            patients={patients}
            detail={active}
            readOnly={true}
            onClose={() => setOpenForm(null)}
          />
        ) : null}
    </div>
  )
}

export default ActivityLog
