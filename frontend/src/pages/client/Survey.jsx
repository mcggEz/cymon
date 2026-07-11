import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../lib/api'
import Skeleton from '../../components/ui/Skeleton'

function ScaleField({ q, value, onChange }) {
  const opts = []
  for (let n = q.min; n <= q.max; n += 1) opts.push(n)
  return (
    <div className="mt-3 flex items-center gap-2 sm:gap-3">
      <span className="w-16 shrink-0 text-right text-xs text-slate-500 sm:w-20">{q.minLabel}</span>
      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
        {opts.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={[
              'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
              value === n
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-purple-200 bg-white text-purple-700 hover:bg-purple-50',
            ].join(' ')}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="w-16 shrink-0 text-left text-xs text-slate-500 sm:w-20">{q.maxLabel}</span>
    </div>
  )
}

function MultiField({ q, value, onChange }) {
  const selected = Array.isArray(value) ? value : []
  const toggle = (opt) =>
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {q.options.map((opt) => (
        <label
          key={opt}
          className={[
            'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
            selected.includes(opt) ? 'border-purple-400 bg-purple-50 text-purple-900' : 'border-slate-200 bg-white text-slate-700',
          ].join(' ')}
        >
          <input
            type="checkbox"
            className="h-4 w-4 accent-purple-600"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

function ChoiceField({ q, value, onChange }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {q.options.map((opt) => (
        <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name={q.key}
            className="h-4 w-4 accent-purple-600"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

function Field({ q, value, onChange }) {
  return (
    <fieldset className="rounded-2xl bg-white p-5 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        {q.label}
        {q.required ? <span className="ml-1 text-rose-500">*</span> : null}
      </legend>
      {q.type === 'scale' ? <ScaleField q={q} value={value} onChange={onChange} /> : null}
      {q.type === 'multi' ? <MultiField q={q} value={value} onChange={onChange} /> : null}
      {q.type === 'choice' ? <ChoiceField q={q} value={value} onChange={onChange} /> : null}
      {q.type === 'text' ? (
        <textarea
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer…"
        />
      ) : null}
    </fieldset>
  )
}

function Survey() {
  const [survey, setSurvey] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let on = true
    api.client
      .survey()
      .then((d) => {
        if (!on) return
        setSurvey(d.survey)
        setSubmitted(d.submitted)
      })
      .catch((e) => on && setError(e.message))
      .finally(() => on && setLoading(false))
    return () => {
      on = false
    }
  }, [])

  const setAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await api.client.submitSurvey({ answers })
      setSubmitted(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Experience Survey" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" rounded="rounded-2xl" />
              <Skeleton className="h-24 w-full" rounded="rounded-2xl" />
            </div>
          ) : submitted ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-bold text-purple-800">Thank you!</h2>
              <p className="mt-1 text-sm text-slate-600">
                Your response has been recorded. It helps ClearMind improve care for every family.
              </p>
            </div>
          ) : survey ? (
            <>
              <div className="rounded-2xl bg-purple-100/70 px-4 py-3 text-sm text-purple-900">{survey.intro}</div>
              <div className="mt-4 space-y-4">
                {survey.questions.map((q) => (
                  <Field key={q.key} q={q} value={answers[q.key]} onChange={(v) => setAnswer(q.key, v)} />
                ))}
              </div>
              {error ? (
                <div className="mt-4 rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
              ) : null}
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-5 w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Survey'}
              </button>
            </>
          ) : (
            <div className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">{error || 'Survey unavailable.'}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default Survey
