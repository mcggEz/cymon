import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import MmseForm from './MmseForm'
import AdaptiveFunctioningForm from './AdaptiveFunctioningForm'
import CaregiverChecklistForm from './CaregiverChecklistForm'
import AnswerAssessment from './AnswerAssessment'
import { useAuth } from '../../../auth/useAuth'

function Assessments() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [patients, setPatients] = useState([])
  const [permissions, setPermissions] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [requestingPermId, setRequestingPermId] = useState(null)
  const [query, setQuery] = useState('')
  const [openForm, setOpenForm] = useState(null)
  const [answerPrefill, setAnswerPrefill] = useState(null)
  const navigate = useNavigate()

  const load = () =>
    api.psychometrician
      .assessments()
      .then((d) => {
        setTests(d.tests || [])
        setPatients(d.patients || [])
        setPermissions(d.permissions || [])
        setEmployees(d.employees || [])
        if (d.patients && d.patients.length > 0 && !selectedPatientId) {
          setSelectedPatientId(d.patients[0].id)
        }
      })
      .catch(() => {})

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

  const handleRequestPermission = async (patientId, templateId) => {
    const key = `${patientId}_${templateId}`
    setRequestingPermId(key)
    try {
      await api.psychometrician.requestAssessmentPermission({ patient_id: patientId, template_id: templateId })
      toast.success('Assessment permission requested from Psychologist.')
      await load()
    } catch (e) {
      toast.error(`Could not request permission: ${e.message}`)
    } finally {
      setRequestingPermId(null)
    }
  }

  const handleGrantPermission = async (patientId, templateId, status) => {
    const key = `${patientId}_${templateId}`
    setRequestingPermId(key)
    try {
      await api.psychologist.grantAssessmentPermission({ patient_id: patientId, template_id: templateId, status })
      toast.success(status === 'granted' ? 'Assessment permission granted.' : 'Assessment permission revoked.')
      await load()
    } catch (e) {
      toast.error(`Could not update permission: ${e.message}`)
    } finally {
      setRequestingPermId(null)
    }
  }

  const getPermissionStatus = (patientId, templateId) => {
    const found = permissions.find((p) => p.patient_id === patientId && p.template_id === templateId)
    return found ? found.status : 'none'
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const activeTests = tests.filter((t) => t.active !== false)

  const q = query.trim().toLowerCase()
  const filteredPatients = patients.filter((p) =>
    !q || [p.name, p.patient_id].some((v) => (v || '').toLowerCase().includes(q))
  )

  const getManualFormName = (code) => {
    if (code?.includes('FO-04')) return 'mmse'
    if (code?.includes('FO-05')) return 'adaptive'
    if (code?.includes('FO-06')) return 'caregiver'
    return null
  }

  const isPsychologist = false // Only Admin approves now

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Students List */}
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
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {p.patient_id || 'N/A'}
                          </div>
                        </div>
                        <span className="font-bold group-hover:underline text-[10px] uppercase text-purple-600">Select &rarr;</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Student Assessment Authorizations */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h1 className="text-xl font-bold text-purple-800">
                      {selectedPatient.name}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      {isPsychologist 
                        ? "Review and directly grant or revoke assessment tool permissions for this student."
                        : "Request psychologist permission for specific assessment tools. Once authorization is granted, you can administer the standardized form."
                      }
                    </p>
                  </div>

                  {/* Assessment Tool Permissions Table */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
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
                              const isBusy = requestingPermId === reqKey
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
                                          {isPsychologist && (
                                            <button
                                              onClick={() => handleGrantPermission(selectedPatientId, t.id, 'none')}
                                              disabled={isBusy}
                                              className="rounded-md border border-red-300 hover:bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 cursor-pointer"
                                            >
                                              Revoke
                                            </button>
                                          )}
                                        </div>
                                      ) : status === 'pending' ? (
                                        isPsychologist ? (
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleGrantPermission(selectedPatientId, t.id, 'granted')}
                                              disabled={isBusy}
                                              className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                            >
                                              Approve
                                            </button>
                                            <button
                                              onClick={() => handleGrantPermission(selectedPatientId, t.id, 'none')}
                                              disabled={isBusy}
                                              className="rounded-md border border-slate-300 hover:bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
                                            >
                                              Deny
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            disabled
                                            className="rounded-md bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-400 cursor-not-allowed"
                                          >
                                            Awaiting Approval
                                          </button>
                                        )
                                      ) : (
                                        isPsychologist ? (
                                          <button
                                            onClick={() => handleGrantPermission(selectedPatientId, t.id, 'granted')}
                                            disabled={isBusy}
                                            className="rounded-md bg-purple-700 hover:bg-purple-800 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                          >
                                            Grant Permission
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleRequestPermission(selectedPatientId, t.id)}
                                            disabled={isBusy}
                                            className="rounded-md border border-purple-300 hover:bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 cursor-pointer"
                                          >
                                            Request Permission
                                          </button>
                                        )
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
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to configure assessment authorizations</p>
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
            load()
          }}
        />
      )}
    </>
  )
}

export default Assessments
