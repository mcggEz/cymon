import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import { api } from '../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''

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
          {a.icon || '⊕'}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="text-base font-semibold text-purple-800">{a.title}</div>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
              {a.status === 'in_progress' ? 'In Progress' : 'New'}
            </span>
          </div>
          {a.due_date ? (
            <p className="mt-1 text-sm text-slate-600">Due {fmtDate(a.due_date)}</p>
          ) : null}
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

function RecordCard({ r }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
            {r.icon || '⊕'}
          </div>
          <div>
            <div className="text-base font-semibold text-purple-800">{r.title}</div>
            <div className="text-xs text-slate-500">
              📅 Submitted: {fmtDate(r.submitted_at)} · Status: {r.status}
            </div>
          </div>
        </div>
        {r.total_score != null ? (
          <span className="rounded-md bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-800">
            {r.total_score}
            {r.max_score != null ? ` / ${r.max_score}` : ''}
          </span>
        ) : null}
      </div>
    </article>
  )
}

function AssessmentCenter() {
  const [tab, setTab] = useState('all')
  const [assigned, setAssigned] = useState([])
  const [records, setRecords] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let on = true
    api.client
      .assessments()
      .then((d) => {
        if (!on) return
        setAssigned(d.assigned)
        setRecords(d.records)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Assessment Center" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          These assessments are about your child&apos;s behaviors and experiences. Answer based on what
          you observe at home. Responses are reviewed by your clinician.
        </div>

        <div className="mt-5">
          <Tabs value={tab} onChange={setTab} />
        </div>

        {tab === 'records' ? (
          <>
            <div className="mt-5 rounded-2xl bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-700">
                <span>📣</span>
                <span className="text-base font-bold">Official Clinical Results</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                To protect your child&apos;s sensitive data, official interpretations, diagnoses, and
                program recommendations are discussed onsite. The scores below are your submitted
                responses.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {records.length === 0 ? (
                <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                  No submitted assessments yet.
                </div>
              ) : null}
              {records.map((r) => (
                <RecordCard key={r.id} r={r} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {assigned.length === 0 ? (
              <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                No assessments assigned right now.
              </div>
            ) : null}
            {assigned.map((a) => (
              <AssessmentCard key={a.id} a={a} onOpen={() => navigate(`/client/assessments/${a.template_id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default AssessmentCenter
