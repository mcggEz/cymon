import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import Button from '../../../components/ui/Button'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

function Assessments() {
  const [templates, setTemplates] = useState([])
  const [activationRequests, setActivationRequests] = useState([])
  const [permissions, setPermissions] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const load = () =>
    api.admin
      .assessments()
      .then((d) => {
        setTemplates(d.templates || [])
        setActivationRequests(d.requests || [])
        setPermissions(d.permissions || [])
        const ptList = d.patients || []
        setPatients(ptList)
        if (ptList.length > 0 && !selectedPatientId) {
          setSelectedPatientId(ptList[0].id)
        }
      })
      .catch((e) => setError(e.message))

  useEffect(() => {
    let on = true
    setLoading(true)
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const handleGrantDirect = async (patientId, templateId, status) => {
    const key = `${patientId}_${templateId}`
    setBusyId(key)
    setError(null)
    try {
      await api.admin.grantPatientPermissionDirect({
        patient_id: patientId,
        template_id: templateId,
        status
      })
      toast.success(status === 'granted' ? 'Assessment permission granted.' : 'Assessment permission revoked.')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleResolveRequest = async (patientId, templateId, status) => {
    const reqRow = permissions.find(
      (p) => p.patient_id === patientId && p.template_id === templateId && p.status === 'pending'
    )
    if (!reqRow) return

    setBusyId(reqRow.id)
    setError(null)
    try {
      await api.admin.resolvePatientPermission(reqRow.id, status)
      toast.success(status === 'granted' ? 'Assessment permission approved.' : 'Assessment request denied.')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleResolveTemplateActivation = async (r, status) => {
    setBusyId(r.id)
    setError(null)
    try {
      await api.admin.resolveAssessmentRequest(r.id, status)
      toast.success(
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

  const toggleTemplateActive = async (t) => {
    setBusyId(t.id)
    setError(null)
    try {
      await api.admin.setAssessmentActive(t.id, !t.active)
      toast.success(`${t.title} is now ${t.active ? 'unavailable' : 'available'}.`)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const getPermissionStatus = (patientId, templateId) => {
    const found = permissions.find((p) => p.patient_id === patientId && p.template_id === templateId)
    return found ? found.status : 'none'
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const q = query.trim().toLowerCase()
  const filteredPatients = patients.filter((p) =>
    !q || [p.name, p.patient_id].some((v) => (v || '').toLowerCase().includes(q))
  )

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {error && (
            <div className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
          )}

          {/* Main Directory & Permissions Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Students Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[650px] flex flex-col">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Student Directory
              </h2>
              <div className="mt-3 shrink-0">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search students…"
                  className="w-full"
                />
              </div>
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse bg-slate-100 rounded-xl" />
                  ))
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    No students found.
                  </div>
                ) : (
                  filteredPatients.map((p) => {
                    const isActive = selectedPatientId === p.id
                    const studentPendingPerms = permissions.filter(pm => pm.patient_id === p.id && pm.status === 'pending')
                    const hasPending = studentPendingPerms.length > 0

                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isActive ? 'border-purple-300 bg-purple-50/40 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm ${isActive ? 'text-purple-800' : 'text-slate-800'}`}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>ID: {p.patient_id || 'N/A'}</span>
                            {hasPending && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">
                                Auth Pending ({studentPendingPerms.length})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold group-hover:underline text-[10px] uppercase text-purple-600 shrink-0 ml-2">Select &rarr;</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Student Permissions Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h1 className="text-xl font-bold text-purple-800">
                      {selectedPatient.name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Directly approve or configure permissions for standardized test answering on this student.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
                      Standardized Assessment Permissions
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                            <th className="py-2.5 px-3 text-left">Assessment Tool</th>
                            <th className="py-2.5 px-3 text-left">Code / Duration</th>
                            <th className="py-2.5 px-3 text-left">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {templates.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                No assessment templates configured.
                              </td>
                            </tr>
                          ) : (
                            templates.map((t) => {
                              const status = getPermissionStatus(selectedPatientId, t.id)
                              const reqKey = `${selectedPatientId}_${t.id}`
                              const isBusy = busyId === reqKey || busyId === permissions.find(p => p.patient_id === selectedPatientId && p.template_id === t.id && p.status === 'pending')?.id

                              return (
                                <tr key={t.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <div className="font-semibold text-slate-800">{t.title}</div>
                                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                                  </td>
                                  <td className="py-3.5 px-3 text-xs text-slate-600">
                                    <div>{t.code}</div>
                                    <div className="text-[10px] text-purple-600 font-medium">{t.duration || 'Standard'}</div>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    {status === 'granted' ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Authorized
                                      </span>
                                    ) : status === 'pending' ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 animate-pulse">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Pending Review
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        Not Requested
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {status === 'granted' ? (
                                        <Button
                                          size="xs"
                                          variant="ghost"
                                          disabled={isBusy}
                                          onClick={() => handleGrantDirect(selectedPatientId, t.id, 'none')}
                                          className="text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200"
                                        >
                                          Revoke
                                        </Button>
                                      ) : status === 'pending' ? (
                                        <>
                                          <Button
                                            size="xs"
                                            disabled={isBusy}
                                            onClick={() => handleResolveRequest(selectedPatientId, t.id, 'none')}
                                            variant="ghost"
                                          >
                                            Deny
                                          </Button>
                                          <Button
                                            size="xs"
                                            disabled={isBusy}
                                            onClick={() => handleResolveRequest(selectedPatientId, t.id, 'granted')}
                                          >
                                            {isBusy ? 'Saving...' : 'Approve'}
                                          </Button>
                                        </>
                                      ) : (
                                        <span className="text-xs text-slate-400 italic font-medium px-2 py-1">No request</span>
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
                </>
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-white p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to configure assessment permissions.</p>
                </div>
              )}
            </div>

          </div>

          {/* Pending Template Activation Requests */}
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wider text-purple-700 uppercase">
              PENDING TEMPLATE ACTIVATION REQUESTS
            </h2>
            <div className="mt-3 space-y-3">
              {loading ? (
                <Skeleton className="h-20 w-full" rounded="rounded-2xl" />
              ) : activationRequests.length === 0 ? (
                <p className="rounded-xl border border-dashed border-purple-200 px-4 py-6 text-center text-sm text-slate-500">
                  No pending template requests. Professionals will appear here when they ask to activate an assessment tool globally.
                </p>
              ) : (
                activationRequests.map((r) => (
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
                          onClick={() => handleResolveTemplateActivation(r, 'declined')}
                        >
                          Decline
                        </Button>
                        <Button size="sm" disabled={busyId === r.id} onClick={() => handleResolveTemplateActivation(r, 'approved')}>
                          {busyId === r.id ? 'Working…' : 'Approve & Activate'}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Global Assessment Library */}
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wider text-purple-700 uppercase">ASSESSMENT LIBRARY</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
                  ))
                : templates.map((t) => (
                    <article key={t.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-purple-800">{t.title}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{t.code}</div>
                        </div>
                        <span
                          className={[
                            'rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider shrink-0',
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
                          onClick={() => toggleTemplateActive(t)}
                        >
                          {busyId === t.id ? 'Working…' : t.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </article>
                  ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

export default Assessments
