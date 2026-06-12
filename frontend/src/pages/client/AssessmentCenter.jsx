import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'

const ASSESSMENTS = [
  {
    id: 'mmse',
    code: 'CMPS: SE-FO-04',
    title: 'Mini-Mental Status Examination',
    desc: 'Evaluates practical, conceptual, social, motor domains, perceptual disturbances and stimming behaviors.',
    icon: '⊕',
  },
  {
    id: 'caft',
    code: 'CMPS: SE-FO-05',
    title: 'Child Adaptive Functioning Tool',
    desc: 'Math, colors, shapes, literacy, word recognition, writing and verbal interpretation.',
    icon: '✕',
  },
  {
    id: 'behav',
    code: 'CMPS: SE-FO-06',
    title: 'Behavioral Assessment',
    desc: 'Evaluate the practical, social, and motor skills based on your daily observations at home.',
    icon: '☺',
  },
]

const SAMPLE_ANSWERS = [
  { indicator: 'Dresses appropriately to the occasion', response: 'Yes' },
  { indicator: 'Can independently drink from a cup or bottle', response: 'Yes' },
  { indicator: 'Names at least two (2) familiar objects (pen, bottle)', response: 'Yes' },
  { indicator: 'Can identify familiar faces (mother, father)', response: 'No' },
  { indicator: 'Makes eye contact when name is called', response: 'Yes' },
  { indicator: 'Responds to greetings (verbal or gestural)', response: 'Yes' },
  { indicator: 'Writes letters or name legibly', response: 'No' },
  { indicator: 'Walks steadily across the room', response: 'Yes' },
]

const RECORDS = [
  { id: 'r1', title: 'Mini-Mental Status Examination', date: 'March 10, 2026', by: 'Dr. Jinky', icon: '⊕', answers: SAMPLE_ANSWERS },
  { id: 'r2', title: 'Mini-Mental Status Examination', date: 'March 10, 2026', by: 'Dr. Jinky', icon: '✕', answers: SAMPLE_ANSWERS },
  { id: 'r3', title: 'Mini-Mental Status Examination', date: 'March 10, 2026', by: 'Dr. Jinky', icon: '☺', answers: SAMPLE_ANSWERS },
]

function Tabs({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-purple-100 p-1 text-sm font-semibold">
      {[
        { id: 'all', label: 'ALL ASSESSMENTS' },
        { id: 'records', label: 'Assessment Records' },
      ].map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              'rounded-lg py-2.5 transition',
              active ? 'bg-purple-700 text-white shadow' : 'text-purple-700 hover:bg-white/40',
            ].join(' ')}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function AssessmentCard({ a, onOpen }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
          {a.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="text-base font-semibold text-purple-800">{a.title}</div>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              New
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
              {a.code}
            </span>
            <button
              onClick={onOpen}
              className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800"
            >
              Start →
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function ResponseBadge({ value }) {
  const yes = value === 'Yes'
  return (
    <span
      className={[
        'inline-flex min-w-[36px] justify-center rounded-md px-2 py-0.5 text-xs font-semibold',
        yes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      ].join(' ')}
    >
      {value}
    </span>
  )
}

function AnswersTable({ answers }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-purple-50 text-left text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            <th className="px-4 py-2">Observation / Indicator</th>
            <th className="w-40 px-4 py-2 text-right">Recorded Response</th>
          </tr>
        </thead>
        <tbody>
          {answers.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-4 py-2 text-slate-700">{row.indicator}</td>
              <td className="px-4 py-2 text-right">
                <ResponseBadge value={row.response} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecordCard({ r, open, onToggle }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
            {r.icon}
          </div>
          <div>
            <div className="text-base font-semibold text-purple-800">{r.title}</div>
            <div className="text-xs text-slate-500">
              📅 Date Taken: {r.date} · Administered by: {r.by}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-md bg-purple-100 px-3 py-2 text-xs font-medium text-purple-800 hover:bg-purple-200"
        >
          View Recorded Answers <span className="text-[10px]">{open ? '▾' : '▸'}</span>
        </button>
      </div>
      {open ? (
        <div className="px-5 pb-5">
          <AnswersTable answers={r.answers} />
        </div>
      ) : null}
    </article>
  )
}

function AssessmentCenter() {
  const [tab, setTab] = useState('all')
  const [openId, setOpenId] = useState('r1')
  const navigate = useNavigate()

  return (
    <>
      <PageHeader title="Assessment Center" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          These assessments are about Leo&apos;s behaviors and experiences. Answer based on what you
          observe at home. Responses are reviewed by Dr. Jinky before the March 15 session.
        </div>

        <div className="mt-5">
          <Tabs value={tab} onChange={setTab} />
        </div>

        {tab === 'records' ? (
          <>
            <div className="mt-5 rounded-2xl bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-700">
                <span>📣</span>
                <span className="text-base font-bold">Official Clinical Results are Ready</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                The clinical interpretation and final scoring of Maria&apos;s assessments have been
                completed by our Chief Psychologist. To protect your child&apos;s sensitive data and
                ensure proper clinical guidance, official interpretations, diagnoses, and program
                recommendations are not displayed online.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Please visit ClearMind Psychological Services onsite to discuss the findings with your
                doctor and claim your physical Certified True Copy of the Behavioral Assessment Report.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {RECORDS.map((r) => (
                <RecordCard
                  key={r.id}
                  r={r}
                  open={openId === r.id}
                  onToggle={() => setOpenId(openId === r.id ? null : r.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {ASSESSMENTS.map((a) => (
              <AssessmentCard key={a.id} a={a} onOpen={() => navigate(`/client/assessments/${a.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default AssessmentCenter
