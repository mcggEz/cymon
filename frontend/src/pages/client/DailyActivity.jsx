import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import PageHeader from './PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

const MOODS = [
  { id: 'very_bad', label: 'Very Bad', color: 'bg-red-400' },
  { id: 'sad', label: 'Sad', color: 'bg-orange-400' },
  { id: 'okay', label: 'Okay', color: 'bg-yellow-400' },
  { id: 'good', label: 'Good', color: 'bg-green-400' },
  { id: 'great', label: 'Great', color: 'bg-emerald-500' },
]

const TASK_LABEL = { yes_all: 'Yes, all', some: 'Some', none: 'None' }
const TASK_DOT = { yes_all: 'bg-green-500', some: 'bg-yellow-500', none: 'bg-red-500' }

const JOURNAL_STATUS = {
  not_started: { label: 'Daily Journal not yet started', cls: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  completed: { label: 'Daily Journal completed — not yet submitted', cls: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  submitted: { label: 'Daily Journal submitted', cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
}
const todayKey = () => new Date().toISOString().slice(0, 10)
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const weekday = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })

function MoodChart({ series }) {
  const max = 5
  const width = 320
  const height = 120
  if (!series || series.length < 2) {
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400">Not enough data yet</div>
  }
  const points = series.map((s) => s.score)
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / max) * height}`)
    .join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="h-32 w-full">
        <path d={path} stroke="#7c3aed" strokeWidth="2.5" fill="none" />
        {points.map((p, i) => (
          <circle key={i} cx={i * step} cy={height - (p / max) * height} r="3" fill="#7c3aed" />
        ))}
        {series.map((s, i) => (
          <text key={i} x={i * step} y={height + 16} fontSize="9" fill="#64748b" textAnchor="middle">
            {weekday(s.date)}
          </text>
        ))}
      </svg>
    </div>
  )
}

function DailyActivity() {
  const [activeDate, setActiveDate] = useState(() => todayKey())
  const [mood, setMood] = useState('okay')
  const [taskCompletion, setTaskCompletion] = useState('')
  const [behavioral, setBehavioral] = useState('')
  const [sleep, setSleep] = useState('')
  const [appetite, setAppetite] = useState('')
  const [observations, setObservations] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [logs, setLogs] = useState([])
  const [series, setSeries] = useState([])
  const [historyQuery, setHistoryQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const hq = historyQuery.trim().toLowerCase()
  const filteredLogs = logs.filter((l) => {
    if (!hq) return true
    const matchesDate = fmtDate(l.log_date).toLowerCase().includes(hq)
    const matchesObs = (l.observations || '').toLowerCase().includes(hq)
    const moodLabel = MOODS.find(m => m.id === l.mood)?.label || ''
    const matchesMood = moodLabel.toLowerCase().includes(hq)
    return matchesDate || matchesObs || matchesMood
  })

  const load = (targetDate = activeDate) =>
    api.client.activityLogs().then((d) => {
      setLogs(d.logs)
      setSeries(d.moodSeries)
      
      // Sync form fields with selected date
      const found = (d.logs || []).find((l) => l.log_date === targetDate)
      if (found) {
        setMood(found.mood)
        setTaskCompletion(found.task_completion || '')
        setBehavioral(found.behavioral_episodes || '')
        setSleep(found.sleep_quality || '')
        setAppetite(found.appetite || '')
        setObservations(found.observations || '')
      } else {
        setMood('okay')
        setTaskCompletion('')
        setBehavioral('')
        setSleep('')
        setAppetite('')
        setObservations('')
      }
    })

  useEffect(() => {
    let on = true
    load(todayKey())
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectLog = (s) => {
    setActiveDate(s.log_date)
    setMood(s.mood)
    setTaskCompletion(s.task_completion || '')
    setBehavioral(s.behavioral_episodes || '')
    setSleep(s.sleep_quality || '')
    setAppetite(s.appetite || '')
    setObservations(s.observations || '')
  }

  const handleBackToToday = () => {
    setActiveDate(todayKey())
    const found = logs.find((l) => l.log_date === todayKey())
    if (found) {
      setMood(found.mood)
      setTaskCompletion(found.task_completion || '')
      setBehavioral(found.behavioral_episodes || '')
      setSleep(found.sleep_quality || '')
      setAppetite(found.appetite || '')
      setObservations(found.observations || '')
    } else {
      setMood('okay')
      setTaskCompletion('')
      setBehavioral('')
      setSleep('')
      setAppetite('')
      setObservations('')
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const exists = logs.some((l) => l.log_date === activeDate)
    try {
      await api.client.addActivityLog({
        mood,
        task_completion: taskCompletion || null,
        behavioral_episodes: behavioral || null,
        sleep_quality: sleep || null,
        appetite: appetite || null,
        observations: observations || null,
        log_date: activeDate,
      })
      toast.success(exists ? 'Journal entry updated.' : 'Journal entry submitted.')
      await load(activeDate)
    } catch (err) {
      toast.error(err.message || 'Failed to save entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const found = logs.find((l) => l.log_date === activeDate)
    if (!found) return
    if (!window.confirm('Are you sure you want to permanently delete this journal entry?')) return
    setSubmitting(true)
    try {
      await api.client.deleteActivityLog(found.id)
      toast.success('Journal entry deleted.')
      await load(activeDate)
    } catch (err) {
      toast.error(err.message || 'Failed to delete entry.')
    } finally {
      setSubmitting(false)
    }
  }

  const submittedToday = logs.some((l) => l.log_date === todayKey())
  const currentLogsToday = logs.find((l) => l.log_date === activeDate)
  const journalStatus = submittedToday ? 'submitted' : (currentLogsToday?.observations || observations).trim() ? 'completed' : 'not_started'
  const status = JOURNAL_STATUS[journalStatus]

  return (
    <>
      <PageHeader title="Daily Journal" />
      <div className="flex-1 overflow-y-auto p-6">

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple-800">Journal Date:</span>
                <input
                  type="date"
                  value={activeDate}
                  onChange={(e) => {
                    const selected = e.target.value
                    if (selected) {
                      setActiveDate(selected)
                      const found = logs.find((l) => l.log_date === selected)
                      if (found) {
                        setMood(found.mood)
                        setTaskCompletion(found.task_completion || '')
                        setBehavioral(found.behavioral_episodes || '')
                        setSleep(found.sleep_quality || '')
                        setAppetite(found.appetite || '')
                        setObservations(found.observations || '')
                      } else {
                        setMood('okay')
                        setTaskCompletion('')
                        setBehavioral('')
                        setSleep('')
                        setAppetite('')
                        setObservations('')
                      }
                    }
                  }}
                  className="h-9 rounded-lg border border-purple-200 bg-white px-3 py-1 text-sm text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              {activeDate !== todayKey() && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveDate(todayKey())
                    const found = logs.find((l) => l.log_date === todayKey())
                    if (found) {
                      setMood(found.mood)
                      setTaskCompletion(found.task_completion || '')
                      setBehavioral(found.behavioral_episodes || '')
                      setSleep(found.sleep_quality || '')
                      setAppetite(found.appetite || '')
                      setObservations(found.observations || '')
                    } else {
                      setMood('okay')
                      setTaskCompletion('')
                      setBehavioral('')
                      setSleep('')
                      setAppetite('')
                      setObservations('')
                    }
                  }}
                  className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer"
                >
                  &larr; Go to Today
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mt-4 relative">
              <label className="text-sm font-semibold text-purple-800">
                Observations & Daily Journal
              </label>
              <div className="relative rounded-2xl border border-purple-200 bg-white p-5 shadow-sm overflow-hidden">
                {/* Spine notebook margin effect */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-purple-100 to-transparent" />
                <div className="absolute left-3 top-0 bottom-0 w-px bg-purple-200" />
                
                <textarea
                  rows={6}
                  className="w-full pl-6 border-none bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-base leading-[28px] font-sans resize-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(124, 58, 237, 0.08) 1px, transparent 1px)',
                    backgroundSize: '100% 28px',
                    lineHeight: '28px',
                    paddingTop: '2px'
                  }}
                  placeholder="How did the day go? Note any new behaviors, concerns, wins, or anything worth recording..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Required — please complete journal entry.</p>
            </div>

            <div className="mt-6 border-t border-purple-50 pt-5">
              <div className="text-sm font-medium text-slate-700">
                How was their general mood today?
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {MOODS.map((m) => {
                  const selected = mood === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={[
                        'flex flex-col items-center rounded-lg border py-1.5 px-2 text-[10px] font-medium transition',
                        selected
                          ? 'border-purple-500 bg-purple-50 text-purple-800'
                          : 'border-slate-200 text-slate-600',
                        'cursor-pointer hover:border-purple-300',
                      ].join(' ')}
                    >
                      <div className={`mb-1 h-5 w-5 rounded-full ${m.color}`} />
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-purple-50 pt-5">
              <div className="text-sm font-semibold text-purple-800 mb-3">Daily Metrics & Observations</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Therapy task completion?" placeholder="Select" value={taskCompletion} onChange={(e) => setTaskCompletion(e.target.value)}>
                  <option value="yes_all">Yes, completed all tasks</option>
                  <option value="some">Some completed</option>
                  <option value="none">None</option>
                </Select>
                <Select label="Behavioral episodes today?" placeholder="Select" value={behavioral} onChange={(e) => setBehavioral(e.target.value)}>
                  <option value="none">No episodes — calm and cooperative</option>
                  <option value="mild">Mild episode</option>
                  <option value="significant">Significant episode</option>
                </Select>
                <Select label="Sleep quality last night" placeholder="Select" value={sleep} onChange={(e) => setSleep(e.target.value)}>
                  <option value="good">Slept well (7+ hours)</option>
                  <option value="restless">Restless</option>
                  <option value="poor">Poor</option>
                </Select>
                <Select label="Appetite / eating today?" placeholder="Select" value={appetite} onChange={(e) => setAppetite(e.target.value)}>
                  <option value="good">Good appetite — ate well</option>
                  <option value="average">Average</option>
                  <option value="refused">Refused meals</option>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="md"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full sm:w-auto cursor-pointer"
              >
                {submitting
                  ? 'Saving…'
                  : logs.some((l) => l.log_date === activeDate)
                  ? 'Update Journal Entry'
                  : 'Submit Journal Entry'}
              </Button>
              {logs.some((l) => l.log_date === activeDate) && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="rounded-md border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                >
                  Delete Journal Entry
                </button>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-purple-800">Journal Archive & History</div>
              <div className="mt-2.5">
                <SearchBar
                  value={historyQuery}
                  onChange={setHistoryQuery}
                  placeholder="Search past logs…"
                  className="w-full"
                />
              </div>
              <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${status.cls}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                {status.label}
              </div>
              {loading ? (
                <SkeletonText className="mt-3" lines={5} />
              ) : (
                <div className="max-h-[320px] overflow-y-auto mt-3 pr-1 space-y-2">
                  <ul className="space-y-2 text-sm">
                    {filteredLogs.length === 0 ? (
                      <li className="text-xs text-slate-500">
                        {historyQuery ? 'No matching logs found.' : 'No submissions yet.'}
                      </li>
                    ) : null}
                    {filteredLogs.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => handleSelectLog(s)}
                          className={`w-full flex items-start gap-3 rounded-xl border p-2.5 text-left transition-all hover:bg-purple-50/40 cursor-pointer group ${
                            activeDate === s.log_date ? 'border-purple-300 bg-purple-50/30' : 'border-transparent'
                          }`}
                        >
                          <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${TASK_DOT[s.task_completion] || 'bg-slate-300'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-800 text-xs sm:text-sm">{fmtDate(s.log_date)}</div>
                            <div className="text-[10px] sm:text-xs text-slate-500 flex items-center justify-between gap-2 mt-0.5">
                              <span>Tasks: {TASK_LABEL[s.task_completion] || '—'}</span>
                              <span className="font-bold group-hover:underline text-[9px] uppercase tracking-wider shrink-0 text-purple-600">View Entry &rarr;</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-purple-800">Mood This Week</div>
              <div className="mt-3">
                {loading ? <Skeleton className="h-32 w-full" /> : <MoodChart series={series} />}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default DailyActivity
