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
  const [reports, setReports] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('reports')
  const [openForm, setOpenForm] = useState(null)
  const [answerPrefill, setAnswerPrefill] = useState(null)
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const [assessmentsData, approvalsData] = await Promise.all([
        api.psychometrician.assessments(),
        api.psychologist.approvals()
      ])
      
      setTests(assessmentsData.tests || [])
      setPatients(assessmentsData.patients || [])
      setPermissions(assessmentsData.permissions || [])
      setReports(approvalsData.reports || [])
    } catch (e) {
      console.error(e)
      toast.error('Error loading approvals data')
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

  // Smart auto-selection of the first patient with a pending item
  useEffect(() => {
    if (!loading && patients.length > 0 && !selectedPatientId) {
      const pendingPatient = patients.find(p => {
        const hasReport = reports.some(r => r.patient_id === p.id)
        const hasPerm = permissions.some(pm => pm.patient_id === p.id && pm.status === 'pending')
        return hasReport || hasPerm
      })
      setSelectedPatientId(pendingPatient ? pendingPatient.id : patients[0].id)
    }
  }, [loading, patients, reports, permissions, selectedPatientId])

  const handleReportAction = async (id, status) => {
    setBusyId(id)
    try {
      await api.psychologist.updateReport(id, { status })
      await loadData()
      toast.success(status === 'approved' ? 'Report approved and signed.' : 'Revision requested.')
    } catch (e) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

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
      const hasReport = reports.some(r => r.patient_id === p.id)
      const hasPerm = permissions.some(pm => pm.patient_id === p.id && pm.status === 'pending')
      return hasReport || hasPerm
    }
    return true
  })

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const activeTests = tests.filter((t) => t.active !== false)
  const patientReports = reports.filter(r => r.patient_id === selectedPatientId)
  const patientPendingPerms = permissions.filter(pm => pm.patient_id === selectedPatientId && pm.status === 'pending')

  const totalPendingReports = reports.length

  return (
    <>
      <StaffHeader title="Approvals" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {totalPendingReports > 0 && (
            <div className="rounded-xl bg-rose-100/80 px-4 py-3 text-sm text-rose-800 mb-6 shadow-sm animate-fadeIn">
              <span className="font-bold">{totalPendingReports} Report{totalPendingReports === 1 ? '' : 's'} Pending Review!</span>
              <div className="mt-0.5 text-xs text-rose-700/80">
                Check the Student Directory below to find students with pending items.
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
                    const studentReports = reports.filter(r => r.patient_id === p.id)
                    const studentPendingPerms = permissions.filter(pm => pm.patient_id === p.id && pm.status === 'pending')
                    const hasReport = studentReports.length > 0
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
                            {hasReport && (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                                Review ({studentReports.length})
                              </span>
                            )}
                            {hasPerm && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">
                                Auth Pending
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
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure standardized test authorizations and review clinical reports.
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {patientReports.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                            {patientReports.length} Report{patientReports.length === 1 ? '' : 's'} Pending
                          </span>
                        )}
                        {patientPendingPerms.length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            {patientPendingPerms.length} Auth Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub Tab Selection */}
                  <div className="flex border-b border-purple-200 bg-white rounded-t-2xl px-5 pt-3">
                    <button
                      onClick={() => setActiveSubTab('reports')}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                        activeSubTab === 'reports'
                          ? 'border-purple-700 text-purple-700'
                          : 'border-transparent text-slate-500 hover:text-purple-700'
                      }`}
                    >
                      Pending Clinical Reports ({patientReports.length})
                    </button>
                    <button
                      onClick={() => setActiveSubTab('assessments')}
                      className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
                        activeSubTab === 'assessments'
                          ? 'border-purple-700 text-purple-700'
                          : 'border-transparent text-slate-500 hover:text-purple-700'
                      }`}
                    >
                      Standardized Test Authorizations ({activeTests.length})
                    </button>
                  </div>

                  {/* Sub Tab Content Panel */}
                  <div className="rounded-b-2xl border-x border-b border-purple-200 bg-white p-5 shadow-sm min-h-[450px]">
                    {activeSubTab === 'reports' ? (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2">
                          Clinical Reports Awaiting Review
                        </h3>
                        {patientReports.length === 0 ? (
                          <div className="text-center py-16 text-sm text-slate-400">
                            No pending reports for this student.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patientReports.map((r) => (
                              <article key={r.id} className="rounded-xl border border-purple-100 bg-purple-50/10 p-5 shadow-sm flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-base font-bold text-purple-800 leading-tight">{r.name}</div>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${priorityTone[r.priority]}`}>
                                      {r.priority}
                                    </span>
                                  </div>
                                  <div className="text-sm text-slate-600 font-medium mt-1">{r.type}</div>
                                  <div className="text-xs text-slate-500 mt-2">Submitted: {fmtDate(r.date)}</div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleReportAction(r.id, 'approved')}
                                    disabled={busyId === r.id}
                                    className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer text-center"
                                  >
                                    {busyId === r.id ? 'Working…' : 'Approve & Sign'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReportAction(r.id, 'revise_requested')}
                                    disabled={busyId === r.id}
                                    className="rounded-md border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60 cursor-pointer text-center"
                                  >
                                    Request Revision
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
                          Standardized Assessment Templates
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
                                  const isBusy = busyId === reqKey
                                  const manualFormKey = getManualFormName(t.code)

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
                                        <div className="flex flex-col gap-1.5 items-end">
                                          {status === 'granted' ? (
                                            <div className="flex items-center gap-2">
                                              {manualFormKey && (
                                                <button
                                                  onClick={() => setOpenForm(manualFormKey)}
                                                  className="rounded-md border border-purple-200 hover:bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 cursor-pointer"
                                                >
                                                  Manual Sheet
                                                </button>
                                              )}
                                              <button
                                                onClick={() => setAnswerPrefill({ patientId: selectedPatientId, templateId: t.id })}
                                                className="rounded-md bg-purple-700 hover:bg-purple-800 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                              >
                                                Answer Assessment
                                              </button>
                                              <button
                                                onClick={() => handlePermission(selectedPatientId, t.id, 'none')}
                                                disabled={isBusy}
                                                className="rounded-md border border-red-300 hover:bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 cursor-pointer"
                                              >
                                                Revoke
                                              </button>
                                            </div>
                                          ) : status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handlePermission(selectedPatientId, t.id, 'granted')}
                                                disabled={isBusy}
                                                className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                              >
                                                Approve
                                              </button>
                                              <button
                                                onClick={() => handlePermission(selectedPatientId, t.id, 'none')}
                                                disabled={isBusy}
                                                className="rounded-md border border-slate-300 hover:bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
                                              >
                                                Deny
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-slate-400 italic">Awaiting request</span>
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
                    )}
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
