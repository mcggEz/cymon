import { useEffect, useState } from 'react'
import StaffHeader from './StaffHeader'
import { api } from '../../lib/api'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'

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

function StudentJournal() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [logs, setLogs] = useState([])
  const [activeLog, setActiveLog] = useState(null)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLoadingLogs(true)
    setLogs([])
    setActiveLog(null)
    
    api.psychometrician.studentJournal(selectedPatientId)
      .then((d) => {
        if (!on) return
        setLogs(d.logs || [])
        if (d.logs && d.logs.length > 0) {
          setActiveLog(d.logs[0])
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch student journals.'))
      .finally(() => {
        if (on) setLoadingLogs(false)
      })
    return () => {
      on = false
    }
  }, [selectedPatientId])

  return (
    <>
      <StaffHeader title="Student Journal Logs" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Patient Selector */}
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Student Journal Reader</h1>
                <p className="text-sm text-slate-500">
                  Select a student to inspect their family-submitted daily logs, activities, and observations.
                </p>
              </div>
              <div className="w-full sm:w-72 shrink-0">
                <label htmlFor="patient-select" className="sr-only">Choose Student</label>
                {loadingPatients ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <select
                    id="patient-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full h-10 rounded-md border border-purple-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                  >
                    {patients.length === 0 ? (
                      <option value="">No patients found</option>
                    ) : (
                      patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.patient_id ? `(${p.patient_id})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
              {error}
            </div>
          )}

          {/* Notebook Workspace */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Sidebar: Submissions List */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[600px] flex flex-col">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Submitted Journal Dates
              </h2>
              <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2">
                {loadingLogs ? (
                  <SkeletonText lines={10} />
                ) : logs.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    No journal submissions for this student yet.
                  </div>
                ) : (
                  logs.map((log) => {
                    const active = activeLog?.id === log.id
                    const moodMeta = MOOD_META[log.mood] || MOOD_META.okay
                    return (
                      <button
                        key={log.id}
                        onClick={() => setActiveLog(log)}
                        className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          active ? 'border-purple-300 bg-purple-50/40 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${moodMeta.color.split(' ')[0]}`} />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm">
                            {fmtDate(log.log_date)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex justify-between items-center">
                            <span>Mood: {moodMeta.label}</span>
                            <span className="font-bold group-hover:underline text-[10px] uppercase text-purple-600">Read &rarr;</span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Notebook View */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-purple-200 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
              
              {/* Spine margin for realistic notebook feel */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-purple-100 to-transparent" />
              <div className="absolute left-3 top-0 bottom-0 w-px bg-purple-200" />
              
              {activeLog ? (
                <div className="flex-1 pl-10 pr-6 py-6 flex flex-col justify-between">
                  <div>
                    {/* Notebook Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-purple-100 pb-4">
                      <div>
                        <div className="text-xs font-mono text-purple-600 uppercase tracking-wider">// caregiver observation log</div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
                          {fmtDate(activeLog.log_date)}
                        </h2>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Student Mood:</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${MOOD_META[activeLog.mood]?.color || MOOD_META.okay.color}`}>
                          {MOOD_META[activeLog.mood]?.label || activeLog.mood}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 gap-4 py-6 border-b border-purple-50">
                      {/* Metric 1 */}
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.task.label}</div>
                        <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.task.tones[activeLog.task_completion] || 'bg-slate-100 text-slate-800'}`}>
                          {METRIC_LABELS.task.values[activeLog.task_completion] || activeLog.task_completion || '—'}
                        </div>
                      </div>
                      {/* Metric 2 */}
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.behavior.label}</div>
                        <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.behavior.tones[activeLog.behavioral_episodes] || 'bg-slate-100 text-slate-800'}`}>
                          {METRIC_LABELS.behavior.values[activeLog.behavioral_episodes] || activeLog.behavioral_episodes || '—'}
                        </div>
                      </div>
                      {/* Metric 3 */}
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.sleep.label}</div>
                        <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.sleep.tones[activeLog.sleep_quality] || 'bg-slate-100 text-slate-800'}`}>
                          {METRIC_LABELS.sleep.values[activeLog.sleep_quality] || activeLog.sleep_quality || '—'}
                        </div>
                      </div>
                      {/* Metric 4 */}
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 font-medium">{METRIC_LABELS.appetite.label}</div>
                        <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${METRIC_LABELS.appetite.tones[activeLog.appetite] || 'bg-slate-100 text-slate-800'}`}>
                          {METRIC_LABELS.appetite.values[activeLog.appetite] || activeLog.appetite || '—'}
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
                          {activeLog.observations || 'No written observations logged for this day.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-purple-100 flex items-center justify-between text-xs text-slate-400">
                    <div>ClearMind Psychological Services · Client Journal Vault</div>
                    <div>Log ID: {activeLog.id.slice(0, 8)}...</div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student and journal entry date</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default StudentJournal
