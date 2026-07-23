import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

const STATUS_META = {
  submitted: { label: 'Submitted', cls: 'bg-sky-100 text-sky-800' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-800' },
  pending_signature: { label: 'Pending Signature', cls: 'bg-amber-100 text-amber-800' },
  overdue: { label: 'Overdue', cls: 'bg-rose-100 text-rose-800 animate-pulse' },
  not_started: { label: 'Not Started', cls: 'bg-slate-100 text-slate-600' },
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

function Waivers() {
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [patient, setPatient] = useState(null)
  const [guardian, setGuardian] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    setLoading(true)
    Promise.all([
      api.client.getPatient().catch((err) => {
        console.error('Failed to load patient:', err)
        return { patient: null, guardian: null }
      }),
      api.client.waivers().catch((err) => {
        console.error('Failed to load waivers:', err)
        return { forms: [] }
      })
    ])
      .then(([patientData, waiversData]) => {
        if (!on) return
        setPatient(patientData?.patient || null)
        setGuardian(patientData?.guardian || null)
        setForms(waiversData?.forms || [])
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
        {loading ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : patient ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-purple-900">{patient.first_name} {patient.last_name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                Parent/Guardian: <span className="font-semibold text-slate-700">{guardian?.full_name || '—'}</span>
                {guardian?.email && (
                  <>
                    {' '}· Email: <span className="font-semibold text-slate-700">{guardian.email}</span>
                  </>
                )}
              </p>
            </div>
            <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              Student ID: {patient.patient_id}
            </span>
          </div>
        ) : null}

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
                            {isSigned && (
                              <button
                                onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                                className="rounded-md border border-purple-200 hover:bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 cursor-pointer shadow-sm transition-colors"
                              >
                                View Signed
                              </button>
                            )}
                            <button
                              disabled
                              className="px-3 py-1.5 text-xs font-semibold text-slate-300 cursor-not-allowed"
                            >
                              Remind
                            </button>
                            <button
                              onClick={() => navigate(`/client/waivers/${encodeURIComponent(f.code)}`)}
                              className={`rounded-lg px-4 py-1.5 text-xs font-bold cursor-pointer shadow-sm transition-colors ${
                                isSigned 
                                  ? 'bg-purple-800 hover:bg-purple-900 text-white' 
                                  : 'bg-purple-300 hover:bg-purple-400 text-purple-900'
                              }`}
                            >
                              Process
                            </button>
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
