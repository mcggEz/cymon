import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'
import ConsentWaiverForm from './ConsentWaiverForm'
import SummerScapeConsentForm from './SummerScapeConsentForm'

const STATUS_META = {
  submitted: { label: 'Submitted', cls: 'bg-emerald-100 text-emerald-700' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700' },
  pending_signature: { label: 'Pending Signature', cls: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'Overdue', cls: 'bg-rose-100 text-rose-700' },
  not_started: { label: 'Not Started', cls: 'bg-slate-100 text-slate-600' },
}

function Waivers() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(null)

  useEffect(() => {
    let on = true
    api.client
      .waivers()
      .then((d) => on && setForms(d.forms))
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
      <PageHeader title="Consents & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Filled out by Leo&apos;s parent or guardian upon enrollment and program registration.
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setOpenForm('consent')}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            Open Consent &amp; Waiver Form
          </button>
          <button
            onClick={() => setOpenForm('summerscape')}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            Open SummerScape Consent Form
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" rounded="rounded-2xl" />
              ))
            : null}
          {!loading &&
            forms.map((f) => {
            const meta = STATUS_META[f.status] || STATUS_META.not_started
            return (
              <button
                key={f.code}
                onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                className="overflow-hidden rounded-2xl border border-purple-200 bg-white text-left shadow-sm transition hover:shadow"
              >
                <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="text-base font-semibold text-purple-800">{f.title}</div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{f.description}</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                        {f.code}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {openForm === 'consent' ? <ConsentWaiverForm onClose={() => setOpenForm(null)} /> : null}
      {openForm === 'summerscape' ? (
        <SummerScapeConsentForm onClose={() => setOpenForm(null)} />
      ) : null}
    </>
  )
}

export default Waivers
