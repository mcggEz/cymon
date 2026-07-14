import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import PageHeader from './PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
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
  const [mood, setMood] = useState('okay')
  const [taskCompletion, setTaskCompletion] = useState('')
  const [behavioral, setBehavioral] = useState('')
  const [sleep, setSleep] = useState('')
  const [appetite, setAppetite] = useState('')
  const [observations, setObservations] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [logs, setLogs] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    api.client.activityLogs().then((d) => {
      setLogs(d.logs)
      setSeries(d.moodSeries)
    })
  useEffect(() => {
    let on = true
    load()
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.client.addActivityLog({
        mood,
        task_completion: taskCompletion || null,
        behavioral_episodes: behavioral || null,
        sleep_quality: sleep || null,
        appetite: appetite || null,
        observations: observations || null,
      })
      setObservations('')
      toast.success('Report sent to the clinic.')
      await load()
    } catch (err) {
      toast.error(err.message || 'Failed to send report.')
    } finally {
      setSubmitting(false)
    }
  }

  const submittedToday = logs.some((l) => l.log_date === todayKey())
  const journalStatus = submittedToday ? 'submitted' : observations.trim() ? 'completed' : 'not_started'
  const status = JOURNAL_STATUS[journalStatus]

  return (
    <>
      <PageHeader title="Daily Activity Log" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Log Leo&apos;s daily observations to help Dr. Jinky design more effective therapy.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="text-sm font-semibold text-purple-800">Log Today&apos;s Activity</div>

            <div className="mt-4 text-sm font-medium text-slate-700">
              How was Leo&apos;s general mood today?
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
                      'flex flex-col items-center rounded-xl border p-2 text-xs font-medium transition',
                      selected
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-slate-200 text-slate-600 hover:border-purple-300',
                    ].join(' ')}
                  >
                    <div className={`mb-1 h-9 w-9 rounded-full ${m.color}`} />
                    {m.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <Textarea
              className="mt-4"
              label="Daily Journal"
              rows={3}
              placeholder="How did the day go? New behaviors, concerns, wins, or anything worth noting…"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">Required — please complete today&apos;s journal entry.</p>

            <Button className="mt-4" size="md" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Report to Clinic'}
            </Button>
          </section>

          <div className="flex flex-col gap-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-purple-800">Recent Submissions</div>
              <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${status.cls}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
                {status.label}
              </div>
              {loading ? (
                <SkeletonText className="mt-3" lines={5} />
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {logs.length === 0 ? (
                    <li className="text-xs text-slate-500">No submissions yet.</li>
                  ) : null}
                  {logs.map((s) => (
                    <li key={s.id} className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2 w-2 rounded-full ${TASK_DOT[s.task_completion] || 'bg-slate-300'}`} />
                      <div>
                        <div className="font-medium text-slate-800">{fmtDate(s.log_date)}</div>
                        <div className="text-xs text-slate-500">Tasks: {TASK_LABEL[s.task_completion] || '—'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
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
