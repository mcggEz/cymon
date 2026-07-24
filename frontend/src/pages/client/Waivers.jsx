import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

const STATUS_META = {
  submitted: { label: 'Submitted & Answered', cls: 'bg-sky-100 text-sky-800 border border-sky-200' },
  approved: { label: 'Approved & Completed', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-255' },
  pending_signature: { label: 'Pending Signature (Not Answered)', cls: 'bg-amber-100 text-amber-850 border border-amber-200' },
  overdue: { label: 'Overdue (Action Required)', cls: 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse' },
  not_started: { label: 'Not Answered Yet', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

function Waivers() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  const EXPECTED_FORMS = [
    { code: 'CMPS:SE-FO-01', title: 'Student Admission Form', description: 'Personal info, parents details, diagnosis, disability, enrollment program selection.' },
    { code: 'CMPS:SE-FO-02', title: 'SPED Consent and Waiver', description: 'Parent / caregiver consent for the Special Education Program.' },
    { code: 'CMPS:SE-FO-12', title: 'SummerScape Waiver', description: 'SummerScape program waiver.' },
    { code: 'CMPS:SE-FO-13', title: 'SummerScape Enrollment', description: 'SummerScape program enrollment form.' }
  ]

  useEffect(() => {
    let on = true
    setLoading(true)
    api.client.waivers()
      .then((waiversData) => {
        if (!on) return
        const apiForms = waiversData?.forms || []
        const mapped = EXPECTED_FORMS.map((ef) => {
          const apiF = apiForms.find((af) => af.code === ef.code)
          return {
            ...ef,
            status: apiF?.status || 'not_started',
            due_date: apiF?.due_date || null,
          }
        })
        setForms(mapped)
      })
      .catch((err) => {
        console.error('Failed to load waivers:', err)
        const fallback = EXPECTED_FORMS.map((ef) => ({
          ...ef,
          status: 'not_started',
          due_date: null,
        }))
        setForms(fallback)
      })
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm min-h-[460px]">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-6">
            Waivers &amp; Consent Forms
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold tracking-wider text-purple-900 border-b border-purple-100 pb-2 text-left">
                  <th className="pb-3 px-2">Document Title</th>
                  <th className="pb-3 px-2">Form Code</th>
                  <th className="pb-3 px-2">Due Date</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/40">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-4 px-2">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : forms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No waivers or forms scheduled.
                    </td>
                  </tr>
                ) : (
                  forms.map((f) => {
                    const meta = STATUS_META[f.status] || STATUS_META.not_started
                    const isSigned = f.status === 'submitted' || f.status === 'approved'
                    const dateColor = isSigned ? 'text-emerald-600 font-semibold' : 'text-slate-500'

                    return (
                      <tr key={f.code} className="hover:bg-purple-50/10 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-slate-800">{f.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{f.description}</div>
                        </td>
                        <td className="py-3.5 px-2 text-xs text-slate-500 font-medium">{f.code}</td>
                        <td className={`py-3.5 px-2 text-xs font-medium ${dateColor}`}>{fmtDate(f.due_date)}</td>
                        <td className="py-3.5 px-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex gap-2 justify-end items-center">
                            {isSigned ? (
                              <button
                                onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                                className="rounded-lg border border-purple-200 hover:bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-750 cursor-pointer shadow-sm transition-colors"
                              >
                                View Signed
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}?view=true`)}
                                  className="rounded-lg border border-purple-200 hover:bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                >
                                  View Form
                                </button>
                                <button
                                  onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                                  className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 text-xs font-bold cursor-pointer shadow-sm transition-colors"
                                >
                                  Sign &amp; Submit
                                </button>
                              </>
                            )}
                          </div>
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
    </>
  )
}

export default Waivers
