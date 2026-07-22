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

        <div className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                  <th className="py-3 px-4 text-left">Document Title</th>
                  <th className="py-3 px-4 text-left">Form Code</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="py-4 px-4">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : forms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      No waivers or forms scheduled.
                    </td>
                  </tr>
                ) : (
                  forms.map((f) => {
                    const meta = STATUS_META[f.status] || STATUS_META.not_started
                    return (
                      <tr key={f.code} className="hover:bg-purple-50/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-purple-800">{f.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{f.description}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                            {f.code}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {f.status === 'submitted' || f.status === 'approved' ? (
                            <button
                              onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                              className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-md border border-purple-200"
                            >
                              View Signed Form
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                              className="text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 px-3 py-1.5 rounded-md cursor-pointer shadow-sm"
                            >
                              Sign Waiver
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
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
