import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
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

function AssessmentCard({ a }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="flex items-start gap-4 p-5">
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
            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              Assigned by {a.assigned_by || 'Clinic Staff'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

// The professional scoring guide (score, interpretation, level) stays confidential
// to the clinic. Patients only see that the assessment is Done and may request a
// viewing, which is subject to clinic approval.
function RecordCard({ r }) {
  const [requested, setRequested] = useState(false)
  return (
    <article className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-semibold text-purple-800">{r.title}</div>
          <div className="text-xs text-slate-500">
            Administered by: {r.by || 'Clinician'} · Submitted: {fmtDate(r.submitted_at)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Done
          </span>
          {requested ? (
            <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Request sent — pending clinic approval
            </span>
          ) : (
            <button
              onClick={() => setRequested(true)}
              className="rounded-md border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
            >
              Request for Viewing
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function AssessmentServices() {
  const [tab, setTab] = useState('all')
  const [assigned, setAssigned] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

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
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          These assessments are administered by your clinician during sessions. You can see what has
          been assigned to your child here; official results are shared with you after clinical review.
        </div>

        <div className="mt-5">
          <Tabs value={tab} onChange={setTab} />
        </div>

        {tab === 'records' ? (
          <>
            <div className="mt-5 rounded-2xl bg-amber-50 p-5">
              <div className="text-amber-700">
                <span className="text-base font-bold">Official Clinical Results</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                To protect your child&apos;s sensitive data, scores, official interpretations,
                diagnoses, and program recommendations are kept confidential and discussed onsite.
                Use <span className="font-semibold">Request for Viewing</span> to ask the clinic for
                access — subject to approval.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" rounded="rounded-2xl" />
                  ))
                : null}
              {!loading && records.length === 0 ? (
                <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                  No submitted assessments yet.
                </div>
              ) : null}
              {!loading &&
                records.map((r) => <RecordCard key={r.id} r={r} />)}
            </div>
          </>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" rounded="rounded-2xl" />
                ))
              : null}
            {!loading && assigned.length === 0 ? (
              <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                No assessments assigned right now.
              </div>
            ) : null}
            {!loading &&
              assigned.map((a) => <AssessmentCard key={a.id} a={a} />)}
          </div>
        )}
      </div>
    </>
  )
}

export default AssessmentServices
