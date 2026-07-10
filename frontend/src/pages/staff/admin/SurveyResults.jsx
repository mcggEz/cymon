import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import { api } from '../../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const avg = (nums) => (nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '—')

function ScaleResult({ q, responses }) {
  const nums = responses.map((r) => Number(r.answers[q.key])).filter((n) => !Number.isNaN(n))
  const counts = {}
  for (let n = q.min; n <= q.max; n += 1) counts[n] = 0
  nums.forEach((n) => {
    if (counts[n] !== undefined) counts[n] += 1
  })
  const max = Math.max(1, ...Object.values(counts))
  return (
    <div>
      <div className="text-sm text-slate-600">
        Average: <span className="font-bold text-purple-800">{avg(nums)}</span> / {q.max}{' '}
        <span className="text-slate-400">({nums.length} answered)</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        {Object.entries(counts).map(([n, c]) => (
          <div key={n} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t bg-purple-400"
                style={{ height: `${(c / max) * 100}%` }}
                title={`${c} response(s)`}
              />
            </div>
            <div className="text-xs font-medium text-slate-600">{n}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionResult({ q, responses }) {
  const counts = {}
  q.options.forEach((o) => (counts[o] = 0))
  responses.forEach((r) => {
    const a = r.answers[q.key]
    const picks = Array.isArray(a) ? a : a ? [a] : []
    picks.forEach((p) => {
      if (counts[p] !== undefined) counts[p] += 1
    })
  })
  const max = Math.max(1, ...Object.values(counts))
  return (
    <div className="space-y-2">
      {q.options.map((o) => (
        <div key={o} className="flex items-center gap-3">
          <div className="w-40 shrink-0 truncate text-sm text-slate-700">{o}</div>
          <div className="h-3 flex-1 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-purple-400" style={{ width: `${(counts[o] / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right text-sm font-medium text-slate-600">{counts[o]}</div>
        </div>
      ))}
    </div>
  )
}

function TextResult({ q, responses }) {
  const answered = responses.filter((r) => r.answers[q.key])
  if (!answered.length) return <p className="text-sm text-slate-400">No responses yet.</p>
  return (
    <ul className="space-y-2">
      {answered.map((r) => (
        <li key={r.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          “{r.answers[q.key]}”
          <span className="ml-2 text-xs text-slate-400">— {r.respondent}</span>
        </li>
      ))}
    </ul>
  )
}

function SurveyResults() {
  const [survey, setSurvey] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let on = true
    api.admin
      .surveys()
      .then((d) => {
        if (!on) return
        setSurvey(d.survey)
        setResponses(d.responses)
      })
      .catch((e) => on && setError(e.message))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader title="Survey Results" subtitle="Caregiver research & usability responses" />
      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="mb-4 rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
        ) : null}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" rounded="rounded-2xl" />
            <Skeleton className="h-32 w-full" rounded="rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
              {responses.length} total response{responses.length === 1 ? '' : 's'}
            </div>
            <div className="mt-4 space-y-4">
              {(survey?.questions || []).map((q) => (
                <section key={q.key} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-purple-800">{q.label}</h2>
                  <div className="mt-3">
                    {responses.length === 0 ? (
                      <p className="text-sm text-slate-400">No responses yet.</p>
                    ) : q.type === 'scale' ? (
                      <ScaleResult q={q} responses={responses} />
                    ) : q.type === 'multi' || q.type === 'choice' ? (
                      <OptionResult q={q} responses={responses} />
                    ) : (
                      <TextResult q={q} responses={responses} />
                    )}
                  </div>
                </section>
              ))}
            </div>
            {responses.length > 0 ? (
              <p className="mt-4 text-xs text-slate-400">
                Latest response: {fmtDate(responses[0].submittedAt)}
              </p>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

export default SurveyResults
