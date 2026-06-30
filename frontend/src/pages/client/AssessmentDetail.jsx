import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from './PageHeader'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

function DomainCard({ domain, answers, remarks, onAnswer, onRemark }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <header className="flex items-center justify-between bg-purple-700 px-4 py-2 text-white">
        <div className="text-sm font-semibold tracking-wider">{domain.title}</div>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
          {domain.items.filter((it) => answers[it.key] === 'yes').length}/{domain.items.length}
        </span>
      </header>
      <div className="divide-y divide-purple-100">
        {domain.items.map((it) => (
          <div key={it.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2">
            <div className="text-sm text-slate-700">{it.label}</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onAnswer(it.key, 'yes')}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium',
                  answers[it.key] === 'yes' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700',
                ].join(' ')}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onAnswer(it.key, 'no')}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium',
                  answers[it.key] === 'no' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700',
                ].join(' ')}
              >
                No
              </button>
            </div>
            <input
              value={remarks[it.key] || ''}
              onChange={(e) => onRemark(it.key, e.target.value)}
              placeholder="Remarks…"
              className="h-8 rounded-md border border-purple-200 bg-purple-50 px-2 text-xs"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function AssessmentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [answers, setAnswers] = useState({})
  const [remarks, setRemarks] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let on = true
    api.client
      .assessmentTemplate(id)
      .then((d) => on && setTemplate(d.template))
      .catch((e) => on && setError(e.message))
    return () => {
      on = false
    }
  }, [id])

  const structure = useMemo(() => template?.structure || [], [template])
  const { total, max } = useMemo(() => {
    let t = 0
    let m = 0
    for (const domain of structure) {
      for (const it of domain.items) {
        m += 1
        if (answers[it.key] === 'yes') t += 1
      }
    }
    return { total: t, max: m }
  }, [structure, answers])

  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }))
  const setRemark = (key, val) => setRemarks((r) => ({ ...r, [key]: val }))

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const answersPayload = {}
      for (const domain of structure) {
        for (const it of domain.items) {
          if (answers[it.key]) answersPayload[it.key] = { response: answers[it.key], remarks: remarks[it.key] || '' }
        }
      }
      const domain_scores = {}
      for (const domain of structure) {
        const score = domain.items.filter((it) => answers[it.key] === 'yes').length
        domain_scores[domain.key] = { score, max: domain.items.length }
      }
      await api.client.submitAssessment(id, {
        answers: answersPayload,
        domain_scores,
        total_score: total,
        max_score: max,
      })
      navigate('/client/assessments')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/client/assessments')}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          ← Back
        </button>

        <h1 className="text-center text-2xl font-bold tracking-wider text-purple-800">
          {template ? template.title.toUpperCase() : 'Loading…'}
        </h1>
        <p className="text-center text-xs uppercase tracking-wider text-slate-500">
          Complete the sections below
        </p>

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-5 flex flex-col gap-4">
          {!template
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" rounded="rounded-2xl" />
              ))
            : structure.map((domain) => (
                <DomainCard
                  key={domain.key}
                  domain={domain}
                  answers={answers}
                  remarks={remarks}
                  onAnswer={setAnswer}
                  onRemark={setRemark}
                />
              ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Score
            </div>
            <div className="text-xs text-slate-500">Counts the indicators marked “Yes”.</div>
          </div>
          <div className="text-3xl font-bold text-purple-800">
            {total} / {max}
          </div>
        </div>

        <Button className="mt-4" fullWidth size="lg" onClick={handleSubmit} disabled={submitting || !template}>
          {submitting ? 'Submitting…' : '✓ Submit Assessment'}
        </Button>
      </div>
    </>
  )
}

export default AssessmentDetail
