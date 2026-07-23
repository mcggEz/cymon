import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'
import MmseForm from '../psychometrician/MmseForm'
import AdaptiveFunctioningForm from '../psychometrician/AdaptiveFunctioningForm'
import CaregiverChecklistForm from '../psychometrician/CaregiverChecklistForm'
import AnswerAssessment from '../psychometrician/AnswerAssessment'
import { useAuth } from '../../../auth/useAuth'

const priorityTone = {
  'High Priority': 'bg-rose-100 text-rose-700',
  'Medium Priority': 'bg-amber-100 text-amber-700',
  'Low Priority': 'bg-sky-100 text-sky-700',
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function Approvals() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [patients, setPatients] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [openForm, setOpenForm] = useState(null)
  const [answerPrefill, setAnswerPrefill] = useState(null)
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const assessmentsData = await api.psychometrician.assessments()
      
      setTests(assessmentsData.tests || [])
      setPatients(assessmentsData.patients || [])
      setPermissions(assessmentsData.permissions || [])
    } catch (e) {
      console.error(e)
      toast.error('Error loading assessments data')
    }
  }

  useEffect(() => {
    let on = true
    setLoading(true)
    loadData().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  // Smart auto-selection of the first patient with a pending permission request
  useEffect(() => {
    if (!loading && patients.length > 0 && !selectedPatientId) {
      const pendingPatient = patients.find(p => {
        const hasPerm = permissions.some(pm => pm.patient_id === p.id && pm.status === 'pending')
        return hasPerm
      })
      setSelectedPatientId(pendingPatient ? pendingPatient.id : patients[0].id)
    }
  }, [loading, patients, permissions, selectedPatientId])

  const handlePermission = async (patientId, templateId, status) => {
    const key = `${patientId}_${templateId}`
    setBusyId(key)
    try {
      await api.psychologist.grantAssessmentPermission({ patient_id: patientId, template_id: templateId, status })
      toast.success(status === 'granted' ? 'Assessment permission granted.' : 'Assessment permission denied.')
      await loadData()
    } catch (e) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const getPermissionStatus = (patientId, templateId) => {
    const found = permissions.find((p) => p.patient_id === patientId && p.template_id === templateId)
    return found ? found.status : 'none'
  }

  const getManualFormName = (code) => {
    if (code?.includes('FO-04')) return 'mmse'
    if (code?.includes('FO-05')) return 'adaptive'
    if (code?.includes('FO-06')) return 'caregiver'
    return null
  }

  const q = query.trim().toLowerCase()
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = !q || [p.name, p.patient_id].some((v) => (v || '').toLowerCase().includes(q))
    if (!matchesSearch) return false

    if (showOnlyPending) {
      const hasPerm = permissions.some(pm => pm.patient_id === p.id && pm.status === 'pending')
      return hasPerm
    }
    return true
  })

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const activeTests = tests.filter((t) => t.active !== false)
  const patientPendingPerms = permissions.filter(pm => pm.patient_id === selectedPatientId && pm.status === 'pending')

  const totalPendingPermissions = permissions.filter(pm => pm.status === 'pending').length

  const handleRequestPermission = async (patientId, templateId) => {
    const key = `${patientId}_${templateId}`
    setBusyId(key)
    try {
      await api.psychometrician.requestAssessmentPermission({ patient_id: patientId, template_id: templateId })
      toast.success('Assessment authorization request sent to Admin.')
      await loadData()
    } catch (e) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <StaffHeader title="Approvals" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {totalPendingPermissions > 0 && (
            <div className="rounded-xl bg-purple-100 px-4 py-3 text-sm text-purple-800 mb-6 shadow-sm animate-fadeIn">
              <span className="font-bold">{totalPendingPermissions} Permission Request{totalPendingPermissions === 1 ? '' : 's'} Pending Admin Review!</span>
              <div className="mt-0.5 text-xs text-purple-700/80">
                You can track the authorization status of standardized templates for each student in the directory below.
              </div>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Student Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[680px] flex flex-col">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Student Directory
              </h2>
              <div className="mt-3 shrink-0 space-y-3">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search students…"
                  className="w-full"
                />
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnlyPending}
                    onChange={(e) => setShowOnlyPending(e.target.checked)}
                    className="rounded border-purple-300 text-purple-700 focus:ring-purple-500 h-4 w-4"
                  />
                  Show only pending items
                </label>
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
                    const hasPerm = studentPendingPerms.length > 0

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
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>ID: {p.patient_id || 'N/A'}</span>
                            {hasPerm && (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                                Pending Access
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

            {/* Right Panel: Student Actions */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage and administer standardized assessment services for this student.
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end items-center">
                        {patientPendingPerms.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 animate-pulse">
                            {patientPendingPerms.length} Request{patientPendingPerms.length === 1 ? '' : 's'} Pending Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Standardized Assessment Permissions Panel */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm min-h-[250px]">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2">
                        Standardized Assessment Permissions
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100 pb-2 text-left">
                              <th className="pb-3 px-2">Assessment Tool</th>
                              <th className="pb-3 px-2">Code / Duration</th>
                              <th className="pb-3 px-2">Status</th>
                              <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-50/40">
                            {activeTests.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                  No assessment templates configured.
                                </td>
                              </tr>
                            ) : (
                              activeTests.map((t) => {
                                const status = getPermissionStatus(selectedPatientId, t.id)
                                const reqKey = `${selectedPatientId}_${t.id}`
                                const isBusy = busyId === reqKey || busyId === permissions.find(p => p.patient_id === selectedPatientId && p.template_id === t.id && p.status === 'pending')?.id

                                return (
                                  <tr key={t.id} className="hover:bg-purple-50/10 transition-colors">
                                    <td className="py-3 px-2">
                                      <div className="font-semibold text-slate-800">{t.title}</div>
                                      <div className="text-[11px] text-slate-400">{t.desc}</div>
                                    </td>
                                    <td className="py-3 px-2 text-xs text-slate-600">
                                      <div>{t.code}</div>
                                      <div className="text-[10px] text-purple-600 font-medium">{t.duration || 'Standard'}</div>
                                    </td>
                                    <td className="py-3 px-2">
                                      {status === 'granted' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                          Authorized
                                        </span>
                                      ) : status === 'pending' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 animate-pulse">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                          Pending Admin Review
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                          Not Requested
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      {status === 'granted' ? (
                                        <div className="flex items-center justify-end gap-2">
                                          {getManualFormName(t.code) && (
                                            <button
                                              onClick={() => setOpenForm(getManualFormName(t.code))}
                                              className="rounded-md border border-purple-200 hover:bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 cursor-pointer"
                                            >
                                              Manual Sheet
                                            </button>
                                          )}
                                          <button
                                            onClick={() => setAnswerPrefill({ patientId: selectedPatientId, templateId: t.id })}
                                            className="rounded-md bg-purple-700 hover:bg-purple-800 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm animate-fadeIn"
                                          >
                                            Answer Assessment
                                          </button>
                                        </div>
                                      ) : status === 'none' ? (
                                        <button
                                          disabled={isBusy}
                                          onClick={() => handleRequestPermission(selectedPatientId, t.id)}
                                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                                        >
                                          {isBusy ? 'Requesting...' : '+ Request Authorization'}
                                        </button>
                                      ) : (
                                        <span className="text-xs text-slate-400 italic font-medium px-2.5">
                                          Requested
                                        </span>
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
                </>
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-white p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to configure authorizations and clinical approvals.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Manual Printable / Sheet Forms Overlay */}
      {openForm === 'mmse' ? <MmseForm onClose={() => setOpenForm(null)} /> : null}
      {openForm === 'adaptive' ? <AdaptiveFunctioningForm onClose={() => setOpenForm(null)} /> : null}
      {openForm === 'caregiver' ? <CaregiverChecklistForm onClose={() => setOpenForm(null)} /> : null}

      {/* Interactive Answer Assessment Overlay */}
      {answerPrefill && (
        <AnswerAssessment
          tests={tests}
          patients={patients}
          prefilledPatientId={answerPrefill.patientId}
          prefilledTemplateId={answerPrefill.templateId}
          onClose={() => {
            setAnswerPrefill(null)
            loadData()
          }}
        />
      )}
    </>
  )
}

export default Approvals;
