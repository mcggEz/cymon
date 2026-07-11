import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import Button from '../../../components/ui/Button'
import { api } from '../../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

function Assessments() {
  const [templates, setTemplates] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState(null)

  const load = () =>
    api.admin
      .assessments()
      .then((d) => {
        setTemplates(d.templates)
        setRequests(d.requests)
      })
      .catch((e) => setError(e.message))

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const toggle = async (t) => {
    setBusyId(t.id)
    setNotice(null)
    setError(null)
    try {
      await api.admin.setAssessmentActive(t.id, !t.active)
      setNotice(`${t.title} is now ${t.active ? 'unavailable' : 'available'}.`)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const resolve = async (r, status) => {
    setBusyId(r.id)
    setNotice(null)
    setError(null)
    try {
      await api.admin.resolveAssessmentRequest(r.id, status)
      setNotice(
        status === 'approved'
          ? `${r.templateTitle} activated — the professional can now assign it.`
          : `Request for ${r.templateTitle} declined.`,
      )
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        {notice ? (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
        ) : null}

        <section>
          <h2 className="text-sm font-semibold tracking-wider text-purple-700">
            PENDING ACTIVATION REQUESTS
          </h2>
          <div className="mt-3 space-y-3">
            {loading ? (
              <Skeleton className="h-20 w-full" rounded="rounded-2xl" />
            ) : requests.length === 0 ? (
              <p className="rounded-xl border border-dashed border-purple-200 px-4 py-6 text-center text-sm text-slate-500">
                No pending requests. Professionals will appear here when they ask to activate an assessment.
              </p>
            ) : (
              requests.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-purple-900">{r.templateTitle}</div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        Requested by {r.requestedBy} · {fmtDate(r.createdAt)}
                      </div>
                      {r.note ? <p className="mt-2 text-sm text-slate-700">“{r.note}”</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id}
                        onClick={() => resolve(r, 'declined')}
                      >
                        Decline
                      </Button>
                      <Button size="sm" disabled={busyId === r.id} onClick={() => resolve(r, 'approved')}>
                        {busyId === r.id ? 'Working…' : 'Approve & Activate'}
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wider text-purple-700">ASSESSMENT LIBRARY</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
                ))
              : templates.map((t) => (
                  <article key={t.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-purple-800">{t.title}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{t.code}</div>
                      </div>
                      <span
                        className={[
                          'rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider',
                          t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                        ].join(' ')}
                      >
                        {t.active ? 'AVAILABLE' : 'UNAVAILABLE'}
                      </span>
                    </div>
                    {t.desc ? <p className="mt-2 text-sm text-slate-600">{t.desc}</p> : null}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{t.duration}</span>
                      <Button
                        size="sm"
                        variant={t.active ? 'ghost' : 'primary'}
                        disabled={busyId === t.id}
                        onClick={() => toggle(t)}
                      >
                        {busyId === t.id ? 'Working…' : t.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </article>
                ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default Assessments
