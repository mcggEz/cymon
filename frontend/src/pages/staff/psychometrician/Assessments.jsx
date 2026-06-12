import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

const TESTS = [
  {
    id: 'mmse',
    code: 'CMPS:SE-FO-04',
    title: 'Mini-Mental Status Examination',
    desc:
      'Evaluates practical, conceptual, social, and motor domains, noting perceptual disturbances and stimming behaviors.',
    duration: 'Est. 15–20 mins',
    icon: '🧠',
  },
  {
    id: 'caft',
    code: 'CMPS:SE-FO-05',
    title: 'Child Adaptive Functioning Tool',
    desc:
      'Interactive tool to test math, colors, shapes, literacy, word recognition, writing, and verbal interpretation.',
    duration: 'Est. 25–30 mins',
    icon: '✦',
  },
]

const LOGS = [
  {
    id: 'dal',
    code: 'CMPS:SE-FO-07',
    title: 'Daily Activity Logging',
    desc:
      "Log daily session procedures, required prompts, and behavioral responses for the student's active session.",
    duration: 'Post-Session',
    icon: '📋',
  },
]

const PATIENTS = [
  'Alex Johnson (09:00 AM Session)',
  'Jordan Smith (10:30 AM Session)',
  'Casey Williams (01:00 PM Session)',
  'Browse All Enrolled Students…',
]

function LaunchModal({ test, onClose, onStart }) {
  const [patient, setPatient] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-purple-800">Launch Assessment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Assigning: <span className="font-medium text-purple-700">{test.title}</span>
        </p>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          SELECT PATIENT FROM SCHEDULE
        </div>
        <select
          className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
        >
          <option value="">-- Choose Patient --</option>
          {PATIENTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            Start Assessment →
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolCard({ t, onLaunch, half = false }) {
  return (
    <article className={`rounded-2xl border border-purple-200 bg-white p-5 shadow-sm ${half ? '' : 'sm:max-w-md'}`}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
          {t.icon}
        </div>
        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
          {t.code}
        </span>
      </div>
      <div className="mt-3 text-base font-semibold text-purple-800">{t.title}</div>
      <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">⏱ {t.duration}</span>
        <button
          onClick={onLaunch}
          className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800"
        >
          Launch Tool
        </button>
      </div>
    </article>
  )
}

function Assessments() {
  const [active, setActive] = useState(null)
  const navigate = useNavigate()

  return (
    <>
      <StaffHeader title="Assessment Center" subtitle="Clinical Tools Library & Observation Forms" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex justify-end">
          <div className="flex w-72 items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm">
            <span>🔍</span>
            <input placeholder="Search assessments or forms…" className="flex-1 bg-transparent outline-none" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-purple-800">
          <span className="underline decoration-2 underline-offset-4">Tool Library</span>
        </h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Select a tool from the library to assign and launch for a patient.
        </div>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          IN PROGRESS (DRAFTS)
        </div>
        <article className="mt-2 flex items-center justify-between rounded-md border border-purple-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <div className="text-sm font-semibold text-purple-800">
              Mini-Mental Status Examination (MMSE)
            </div>
            <div className="text-xs text-slate-500">
              Patient: Alex Johnson · Last edited: 10 mins ago
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-amber-600">Draft Auto-Saved</span>
            <button className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800">
              Resume →
            </button>
          </div>
        </article>

        <div className="mt-6 text-xs font-semibold tracking-wider text-purple-700">
          STANDARDIZED TESTS
        </div>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TESTS.map((t) => (
            <ToolCard key={t.id} t={t} half onLaunch={() => setActive(t)} />
          ))}
        </div>

        <div className="mt-6 text-xs font-semibold tracking-wider text-purple-700">
          SESSION LOGS & OBSERVATIONS
        </div>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {LOGS.map((t) => (
            <ToolCard key={t.id} t={t} half onLaunch={() => navigate('/psychometrician/activity')} />
          ))}
        </div>

        {active ? (
          <LaunchModal
            test={active}
            onClose={() => setActive(null)}
            onStart={() => {
              setActive(null)
              navigate('/psychometrician/data-review')
            }}
          />
        ) : null}
      </div>
    </>
  )
}

export default Assessments
