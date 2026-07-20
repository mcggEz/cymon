import { useEffect, useState } from 'react'
import StaffHeader from './StaffHeader'
import { api } from '../../lib/api'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
import SearchBar from '../../components/ui/SearchBar'

const MOOD_META = {
  very_bad: { label: 'Very Bad', color: 'bg-red-400 text-white' },
  sad: { label: 'Sad', color: 'bg-orange-400 text-white' },
  okay: { label: 'Okay', color: 'bg-yellow-400 text-slate-800' },
  good: { label: 'Good', color: 'bg-green-400 text-white' },
  great: { label: 'Great', color: 'bg-emerald-500 text-white' },
}

const METRIC_LABELS = {
  task: {
    label: 'Therapy Tasks',
    values: { yes_all: 'Completed All Tasks', some: 'Some Completed', none: 'None' },
    tones: { yes_all: 'bg-green-100 text-green-800', some: 'bg-yellow-100 text-yellow-800', none: 'bg-red-100 text-red-800' }
  },
  behavior: {
    label: 'Behavioral Episodes',
    values: { none: 'No Episodes (Calm)', mild: 'Mild Episode', significant: 'Significant Episode' },
    tones: { none: 'bg-green-100 text-green-800', mild: 'bg-amber-100 text-amber-800', significant: 'bg-rose-100 text-rose-800' }
  },
  sleep: {
    label: 'Sleep Quality',
    values: { good: 'Slept Well (7+ hrs)', restless: 'Restless Sleep', poor: 'Poor Sleep' },
    tones: { good: 'bg-blue-100 text-blue-800', restless: 'bg-purple-100 text-purple-800', poor: 'bg-slate-100 text-slate-800' }
  },
  appetite: {
    label: 'Eating / Appetite',
    values: { good: 'Good Appetite', average: 'Average Appetite', refused: 'Refused Meals' },
    tones: { good: 'bg-emerald-100 text-emerald-800', average: 'bg-amber-100 text-amber-800', refused: 'bg-red-100 text-red-800' }
  }
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''

function JournalDetailModal({ log, onClose }) {
  if (!log) return null
  const moodMeta = MOOD_META[log.mood] || MOOD_META.okay

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Spine margin for realistic notebook feel */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-purple-100 to-transparent" />
        <div className="absolute left-3 top-0 bottom-0 w-px bg-purple-200" />

        <div className="flex-1 pl-10 pr-6 py-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Notebook Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4">
              <div>
                <div className="text-xs font-mono text-purple-600 uppercase tracking-wider">// caregiver observation log</div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
                  {fmtDate(log.log_date)}
                </h2>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Student Mood:</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${moodMeta.color}`}>
                  {moodMeta.label}
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-4 py-6 border-b border-purple-50">
              {/* Metric 1 */}
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.task.label}</div>
                <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.task.tones[log.task_completion] || 'bg-slate-100 text-slate-800'}`}>
                  {METRIC_LABELS.task.values[log.task_completion] || log.task_completion || '—'}
                </div>
              </div>
              {/* Metric 2 */}
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.behavior.label}</div>
                <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.behavior.tones[log.behavioral_episodes] || 'bg-slate-100 text-slate-800'}`}>
                  {METRIC_LABELS.behavior.values[log.behavioral_episodes] || log.behavioral_episodes || '—'}
                </div>
              </div>
              {/* Metric 3 */}
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.sleep.label}</div>
                <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.sleep.tones[log.sleep_quality] || 'bg-slate-100 text-slate-800'}`}>
                  {METRIC_LABELS.sleep.values[log.sleep_quality] || log.sleep_quality || '—'}
                </div>
              </div>
              {/* Metric 4 */}
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.appetite.label}</div>
                <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.appetite.tones[log.appetite] || 'bg-slate-100 text-slate-800'}`}>
                  {METRIC_LABELS.appetite.values[log.appetite] || log.appetite || '—'}
                </div>
              </div>
            </div>

            {/* Notebook Ruled Body */}
            <div className="mt-6">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">// Caregiver Notes & Observations</div>
              <div 
                className="p-6 rounded-xl bg-purple-50/30 border border-purple-100 min-h-[220px]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px)',
                  backgroundSize: '100% 28px',
                  lineHeight: '28px'
                }}
              >
                <p className="text-slate-700 font-sans text-base whitespace-pre-wrap leading-[28px] pt-1">
                  {log.observations || 'No written observations logged for this day.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-purple-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">ClearMind Psychological Services · Client Journal Vault</div>
            <button
              onClick={onClose}
              className="rounded-md bg-purple-700 hover:bg-purple-800 px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors"
            >
              Close Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentJournal() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [logs, setLogs] = useState([])
  const [activeLog, setActiveLog] = useState(null)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [query, setQuery] = useState('')
  const [journalQuery, setJournalQuery] = useState('')
  const [error, setError] = useState(null)

  // Load patients lookup on mount
  useEffect(() => {
    let on = true
    api.psychometrician.patients()
      .then((d) => {
        if (!on) return
        setPatients(d.patients || [])
        if (d.patients && d.patients.length > 0) {
          setSelectedPatientId(d.patients[0].id)
        }
      })
      .catch((err) => setError(err.message || 'Failed to load patients.'))
      .finally(() => {
        if (on) setLoadingPatients(false)
      })
    return () => {
      on = false
    }
  }, [])

  // Load logs when selected patient changes
  useEffect(() => {
    if (!selectedPatientId) return
    let on = true
    setLoadingLogs(true)
    setLogs([])
    setJournalQuery('')
    
    api.psychometrician.studentJournal(selectedPatientId)
      .then((d) => {
        if (!on) return
        setLogs(d.logs || [])
      })
      .catch((err) => setError(err.message || 'Failed to fetch student journals.'))
      .finally(() => {
        if (on) setLoadingLogs(false)
      })
    return () => {
      on = false
    }
  }, [selectedPatientId])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const jq = journalQuery.trim().toLowerCase()
  const filteredLogs = logs.filter((log) => {
    if (!jq) return true
    const moodMeta = MOOD_META[log.mood] || MOOD_META.okay
    const matchesDate = fmtDate(log.log_date).toLowerCase().includes(jq)
    const matchesMood = (moodMeta.label || '').toLowerCase().includes(jq)
    const matchesObs = (log.observations || '').toLowerCase().includes(jq)
    return matchesDate || matchesMood || matchesObs
  })

  return (
    <>
      <StaffHeader title="Student Journal Logs" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
              {error}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Students List */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[650px] flex flex-col">
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
                {loadingPatients ? (
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
                          isActive ? 'border-purple-300 bg-purple-50/40 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm ${isActive ? 'text-purple-800' : 'text-slate-800'}`}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {p.patient_id || 'N/A'}
                          </div>
                        </div>
                        <span className="font-bold group-hover:underline text-[10px] uppercase text-purple-600">Select &rarr;</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Student Journal logs */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h1 className="text-xl font-bold text-purple-800">
                      {selectedPatient.name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Inspect family-submitted daily logs, activities, and observations. Select a journal entry from the history table below to see its details.
                    </p>
                  </div>

                  {/* Journal Submissions List Table */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-3 mb-4 gap-3">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">
                        Caregiver Journal Entries
                      </h3>
                      <div className="w-full sm:w-72">
                        <SearchBar
                          value={journalQuery}
                          onChange={setJournalQuery}
                          placeholder="Search logs by date, mood, observation…"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                            <th className="py-2.5 px-3 text-left">Date</th>
                            <th className="py-2.5 px-3 text-left">Mood</th>
                            <th className="py-2.5 px-3 text-left">Therapy Tasks</th>
                            <th className="py-2.5 px-3 text-left">Behavioral Episodes</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {loadingLogs ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                              <tr key={idx}>
                                <td className="py-3 px-3"><Skeleton className="h-4 w-28" /></td>
                                <td className="py-3 px-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                <td className="py-3 px-3"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-3"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-3 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-md" /></td>
                              </tr>
                            ))
                          ) : filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                {journalQuery ? 'No journal entries match your search.' : 'No journal submissions logged for this student yet.'}
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log) => {
                              const moodMeta = MOOD_META[log.mood] || MOOD_META.okay
                              return (
                                <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3 px-3 font-semibold text-slate-800">
                                    {fmtDate(log.log_date)}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${moodMeta.color}`}>
                                      {moodMeta.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-xs text-slate-600">
                                    {METRIC_LABELS.task.values[log.task_completion] || log.task_completion || '—'}
                                  </td>
                                  <td className="py-3 px-3 text-xs text-slate-600">
                                    {METRIC_LABELS.behavior.values[log.behavioral_episodes] || log.behavioral_episodes || '—'}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <button
                                      onClick={() => setActiveLog(log)}
                                      className="rounded-md bg-purple-700 hover:bg-purple-800 px-3 py-1 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
                                    >
                                      Read Entry
                                    </button>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-white p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student from the list to view their journal logs</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {activeLog && (
        <JournalDetailModal log={activeLog} onClose={() => setActiveLog(null)} />
      )}
    </>
  )
}

export default StudentJournal
