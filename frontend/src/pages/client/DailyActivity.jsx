import { useState } from 'react'
import PageHeader from './PageHeader'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'

const MOODS = [
  { id: 'very-bad', label: 'Very Bad', color: 'bg-red-400', emoji: '😣' },
  { id: 'sad', label: 'Sad', color: 'bg-orange-400', emoji: '🙁' },
  { id: 'okay', label: 'Okay', color: 'bg-yellow-400', emoji: '😐' },
  { id: 'good', label: 'Good', color: 'bg-green-400', emoji: '🙂' },
  { id: 'great', label: 'Great', color: 'bg-emerald-500', emoji: '😄' },
]

const SUBMISSIONS = [
  { date: 'Mar 11, 2026', tasks: 'Yes, all', dot: 'bg-green-500' },
  { date: 'Mar 10, 2026', tasks: 'Yes, all', dot: 'bg-green-500' },
  { date: 'Mar 9, 2026', tasks: 'Some', dot: 'bg-yellow-500' },
  { date: 'Mar 8, 2026', tasks: 'None', dot: 'bg-red-500' },
  { date: 'Mar 7, 2026', tasks: 'Yes, all', dot: 'bg-green-500' },
]

function MoodChart() {
  const points = [3.0, 3.5, 4.0, 3.2, 4.5, 4.2, 4.6]
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const max = 5
  const width = 320
  const height = 120
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
        {labels.map((l, i) => (
          <text key={l} x={i * step} y={height + 16} fontSize="9" fill="#64748b" textAnchor="middle">
            {l}
          </text>
        ))}
      </svg>
    </div>
  )
}

function DailyActivity() {
  const [mood, setMood] = useState('okay')

  return (
    <>
      <PageHeader title="Daily Activity Log" subtitle="March 29, 2026" />
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
                    <div className={`mb-1 flex h-9 w-9 items-center justify-center rounded-full text-base ${m.color}`}>
                      {m.emoji}
                    </div>
                    {m.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Therapy task completion?" placeholder="Select">
                <option>Yes, completed all tasks</option>
                <option>Some completed</option>
                <option>None</option>
              </Select>
              <Select label="Behavioral episodes today?" placeholder="Select">
                <option>No episodes — calm and cooperative</option>
                <option>Mild episode</option>
                <option>Significant episode</option>
              </Select>
              <Select label="Sleep quality last night" placeholder="Select">
                <option>Slept well (7+ hours)</option>
                <option>Restless</option>
                <option>Poor</option>
              </Select>
              <Select label="Appetite / eating today?" placeholder="Select">
                <option>Good appetite — ate well</option>
                <option>Average</option>
                <option>Refused meals</option>
              </Select>
            </div>

            <Textarea
              className="mt-4"
              label="Additional observations (optional)"
              rows={3}
              placeholder="Any specific notes, new behaviors, concerns, or positive highlights…"
            />

            <Button className="mt-4" size="md">
              Send Report to Clinic
            </Button>
          </section>

          <div className="flex flex-col gap-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-purple-800">Recent Submissions</div>
              <ul className="mt-3 space-y-3 text-sm">
                {SUBMISSIONS.map((s) => (
                  <li key={s.date} className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${s.dot}`} />
                    <div>
                      <div className="font-medium text-slate-800">{s.date}</div>
                      <div className="text-xs text-slate-500">Tasks: {s.tasks}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-purple-800">Mood This Week</div>
              <div className="mt-3">
                <MoodChart />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default DailyActivity
