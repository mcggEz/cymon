import { useMemo, useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'

const selectClass = 'mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm disabled:bg-purple-50 disabled:text-slate-500'
const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-purple-800'

function DomainCard({ domain, answers, remarks, onAnswer, onRemark, readOnly = false }) {
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
                onClick={() => !readOnly && onAnswer(it.key, 'yes')}
                disabled={readOnly}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  answers[it.key] === 'yes'
                    ? 'bg-green-500 text-white'
                    : readOnly
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer',
                ].join(' ')}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => !readOnly && onAnswer(it.key, 'no')}
                disabled={readOnly}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  answers[it.key] === 'no'
                    ? 'bg-rose-500 text-white'
                    : readOnly
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer',
                ].join(' ')}
              >
                No
              </button>
            </div>
            <input
              value={remarks[it.key] || ''}
              onChange={(e) => !readOnly && onRemark(it.key, e.target.value)}
              disabled={readOnly}
              placeholder={readOnly ? '—' : 'Remarks…'}
              className="h-8 rounded-md border border-purple-200 bg-purple-50 px-2 text-xs disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function AnswerAssessment({
  tests,
  patients,
  prefilledPatientId,
  prefilledTemplateId,
  isClient = false,
  prefilledPatientName = '',
  prefilledTemplateName = '',
  onClose,
  readOnly = false,
  submission = null
}) {
  const [patientId, setPatientId] = useState(prefilledPatientId || '')
  const [templateId, setTemplateId] = useState(prefilledTemplateId || '')
  const [template, setTemplate] = useState(null)
  const [loadingTpl, setLoadingTpl] = useState(false)
  const [answers, setAnswers] = useState({})
  const [remarks, setRemarks] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const activeTests = (tests || []).filter((t) => t.active !== false)

  const pickTemplate = async (id) => {
    setTemplateId(id)
    setTemplate(null)
    if (!submission) {
      setAnswers({})
      setRemarks({})
    }
    setError(null)
    if (!id) return
    setLoadingTpl(true)
    try {
      const d = isClient 
        ? await api.client.assessmentTemplate(id)
        : await api.psychometrician.assessmentTemplate(id)
      setTemplate(d.template)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingTpl(false)
    }
  }

  useEffect(() => {
    if (prefilledTemplateId) {
      pickTemplate(prefilledTemplateId)
    }
  }, [prefilledTemplateId])

  useEffect(() => {
    if (submission) {
      const initialAnswers = {}
      const initialRemarks = {}
      if (submission.answers) {
        Object.entries(submission.answers).forEach(([key, val]) => {
          initialAnswers[key] = val?.response || ''
          initialRemarks[key] = val?.remarks || ''
        })
      }
      setAnswers(initialAnswers)
      setRemarks(initialRemarks)
    }
  }, [submission])

  const structure = useMemo(() => template?.structure || [], [template])
  const { total, max } = useMemo(() => {
    let t = 0
    let m = 0
    for (const d of structure) {
      for (const it of d.items) {
        m += 1
        if (answers[it.key] === 'yes') t += 1
      }
    }
    return { total: t, max: m }
  }, [structure, answers])

  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }))
  const setRemark = (key, val) => setRemarks((r) => ({ ...r, [key]: val }))

  const submit = async () => {
    if (readOnly) return
    setError(null)
    if (!isClient && !patientId) {
      setError('Select a patient first.')
      return
    }
    setSubmitting(true)
    try {
      const answersPayload = {}
      for (const d of structure) {
        for (const it of d.items) {
          if (answers[it.key]) answersPayload[it.key] = { response: answers[it.key], remarks: remarks[it.key] || '' }
        }
      }
      const domain_scores = {}
      for (const d of structure) {
        const score = d.items.filter((it) => answers[it.key] === 'yes').length
        domain_scores[d.key] = { score, max: d.items.length }
      }
      if (isClient) {
        await api.client.submitAssessment(templateId, {
          answers: answersPayload,
          domain_scores,
          total_score: total,
          max_score: max,
        })
      } else {
        await api.psychometrician.submitAssessment(templateId, {
          patient_id: patientId,
          answers: answersPayload,
          domain_scores,
          total_score: total,
          max_score: max,
        })
      }
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/80"
      role="dialog"
      aria-modal="true"
      aria-label="Administer assessment"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 text-white">
        <div className="text-sm font-semibold">
          {readOnly ? 'View Assessment' : 'Administer Assessment'}
        </div>
        <button
          onClick={onClose}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 cursor-pointer transition-all"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#efeaf7] p-4 sm:p-6">
        {done ? (
          <div className="mx-auto max-w-md rounded-2xl border border-purple-200 bg-white p-6 text-center shadow-sm">
            <div className="text-lg font-semibold text-purple-800">Assessment recorded</div>
            <p className="mt-1 text-sm text-slate-600">
              The submission was saved.
            </p>
            <Button className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{isClient ? 'Student' : 'Patient'}</label>
                {isClient ? (
                  <div className="mt-1 flex h-10 items-center rounded-md border border-purple-200 bg-purple-50 px-3 text-sm font-semibold text-purple-900">
                    {prefilledPatientName || 'Your Child'}
                  </div>
                ) : (
                  <select className={selectClass} value={patientId} onChange={(e) => setPatientId(e.target.value)} disabled={true}>
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className={labelClass}>Assessment</label>
                {isClient ? (
                  <div className="mt-1 flex h-10 items-center rounded-md border border-purple-200 bg-purple-50 px-3 text-sm font-semibold text-purple-900">
                    {prefilledTemplateName || template?.title || 'Caregiver Checklist'}
                  </div>
                ) : (
                  <select className={selectClass} value={templateId} onChange={(e) => pickTemplate(e.target.value)} disabled={true}>
                    <option value="">Select assessment</option>
                    {activeTests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}

            <div className="mt-5 flex flex-col gap-4">
              {loadingTpl
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" rounded="rounded-2xl" />
                  ))
                : null}
              {!loadingTpl && template && structure.length === 0 ? (
                <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                  This assessment has no question structure to display.
                </div>
              ) : null}
              {!loadingTpl &&
                structure.map((domain) => (
                  <DomainCard
                    key={domain.key}
                    domain={domain}
                    answers={answers}
                    remarks={remarks}
                    onAnswer={setAnswer}
                    onRemark={setRemark}
                    readOnly={readOnly}
                  />
                ))}
            </div>

            {structure.length > 0 ? (
              <>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Overall Score
                    </div>
                    <div className="text-xs text-slate-500">Counts the indicators marked &ldquo;Yes&rdquo;.</div>
                  </div>
                  <div className="text-3xl font-bold text-purple-800">
                    {total} / {max}
                  </div>
                </div>
                {!readOnly && (
                  <Button
                    className="mt-4"
                    fullWidth
                    size="lg"
                    onClick={submit}
                    disabled={submitting || !patientId}
                  >
                    {submitting ? 'Submitting…' : 'Submit Assessment'}
                  </Button>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnswerAssessment
