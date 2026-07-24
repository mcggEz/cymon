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
import BehavioralAssessmentForm from './BehavioralAssessmentForm'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700 border border-amber-200' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700 border border-sky-200' },
  approved: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
}

function Assessments() {
  const { profile } = useAuth()
  const [tests, setTests] = useState([])
  const [patients, setPatients] = useState([])
  const [permissions, setPermissions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [employees, setEmployees] = useState([])
  const [reports, setReports] = useState([])
  const [activeReport, setActiveReport] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [openForm, setOpenForm] = useState(null)
  const [answerPrefill, setAnswerPrefill] = useState(null)
  const navigate = useNavigate()

  const load = () =>
    Promise.all([
      api.psychometrician.assessments(),
      api.psychometrician.draftingReports()
    ]).then(([d, draftingData]) => {
      setTests(d.tests || [])
      setPatients(d.patients || [])
      setPermissions(d.permissions || [])
      setSubmissions(d.submissions || [])
      setEmployees(d.employees || [])
      setReports(draftingData.rows || [])
      if (d.patients && d.patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(d.patients[0].id)
      }
    }).catch(() => {})

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

  const patientReports = selectedPatient
    ? reports.filter((r) => r.name.toLowerCase() === selectedPatient.name.toLowerCase())
    : []

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Student Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[740px] flex flex-col">
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
                          isActive ? 'border-purple-300 bg-purple-100 shadow-sm text-purple-955 font-bold animate-fadeIn' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm ${isActive ? 'text-purple-950 font-bold' : 'text-slate-800'}`}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {p.patient_id || 'N/A'}
                          </div>
                        </div>
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Select and administer standardized clinical assessments for this student. Submissions will be forwarded to the supervising Psychologist for final signature.
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end items-center">
                        <button
                          onClick={() => setOpenForm('behavioral')}
                          className="rounded-md bg-purple-750 hover:bg-purple-800 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer shadow-sm transition-all"
                        >
                          + Write Behavioral Assessment Report
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Tool Catalog Table */}
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
                            <th className="py-3.5 px-3 text-right">Actions</th>
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
                              const sub = submissions.find(s => s.patient_id === selectedPatientId && s.template_id === t.id)
                              const manualFormKey = getManualFormName(t.code)

                              let statusBadge = null
                              let actionBtn = null

                              if (sub) {
                                if (sub.status === 'scored') {
                                  statusBadge = (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      Approved &amp; Completed
                                    </span>
                                  )
                                  actionBtn = (
                                    <span className="text-xs text-emerald-600 font-semibold px-2">Approved</span>
                                  )
                                } else if (sub.status === 'revalidation') {
                                  statusBadge = (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 animate-pulse border border-rose-200">
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                      Revalidation Required
                                    </span>
                                  )
                                  actionBtn = (
                                    <button
                                      onClick={() => setAnswerPrefill({ patientId: selectedPatientId, templateId: t.id })}
                                      className="rounded-md bg-purple-700 hover:bg-purple-800 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                    >
                                      Answer (Revalidate)
                                    </button>
                                  )
                                } else {
                                  statusBadge = (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-200">
                                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                                      Pending Approval
                                    </span>
                                  )
                                  actionBtn = (
                                    <span className="text-xs text-slate-400 font-medium italic px-2">Awaiting Approval</span>
                                  )
                                }
                              } else {
                                statusBadge = (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    Not Started
                                  </span>
                                )
                                actionBtn = (
                                  <button
                                    onClick={() => setAnswerPrefill({ patientId: selectedPatientId, templateId: t.id })}
                                    className="rounded-md bg-purple-700 hover:bg-purple-800 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm"
                                  >
                                    Answer Assessment
                                  </button>
                                )
                              }

                              return (
                                <tr key={t.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3.5 px-3">
                                    <div className="font-semibold text-slate-800">{t.title}</div>
                                    <div className="text-[11px] text-slate-400">{t.desc}</div>
                                  </td>
                                  <td className="py-3.5 px-3 text-xs text-slate-650">
                                    <div>{t.code}</div>
                                    <div className="text-[10px] text-purple-650 font-medium">{t.duration || 'Standard'}</div>
                                  </td>
                                  <td className="py-3.5 px-3">
                                    {statusBadge}
                                  </td>
                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {manualFormKey && (!sub || sub.status !== 'scored') && (
                                        <button
                                          onClick={() => setOpenForm(manualFormKey)}
                                          className="rounded-md border border-purple-200 hover:bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 cursor-pointer"
                                        >
                                          Manual Sheet
                                        </button>
                                      )}
                                      {actionBtn}
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

                  {/* Behavioral Assessment Reports Panel */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2">
                        Behavioral Assessment Reports ledger
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100 pb-2 text-left">
                              <th className="pb-3 px-2">Report Title</th>
                              <th className="pb-3 px-2">Last Updated Date</th>
                              <th className="pb-3 px-2">Status</th>
                              <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-50/40">
                            {patientReports.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                  No behavioral assessment reports drafted for this student.
                                </td>
                              </tr>
                            ) : (
                              patientReports.map((r) => {
                                const meta = STATUS_META[r.status] || STATUS_META.draft
                                return (
                                  <tr key={`${r.type}-${r.id}`} className="hover:bg-purple-50/10 transition-colors">
                                    <td className="py-3 px-2 font-medium text-slate-800">{r.title}</td>
                                    <td className="py-3 px-2 text-xs text-slate-505">{fmtDate(r.date)}</td>
                                    <td className="py-3 px-2">
                                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.tone}`}>
                                        {meta.label}
                                      </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      <button
                                        onClick={() => {
                                          setActiveReport(r)
                                          setOpenForm('viewBehavioral')
                                        }}
                                        className="rounded-md border border-purple-200 hover:bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                      >
                                        {r.status === 'draft' ? 'View & Edit' : 'View Form'}
                                      </button>
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
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to configure assessment actions.</p>
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

      {openForm === 'behavioral' ? (
        <BehavioralAssessmentForm 
          onClose={() => {
            setOpenForm(null)
            load()
          }} 
        />
      ) : null}
      {openForm === 'viewBehavioral' && activeReport ? (
        <BehavioralAssessmentForm
          detail={activeReport}
          readOnly={activeReport.status !== 'draft'}
          onClose={() => {
            setOpenForm(null)
            load()
          }}
        />
      ) : null}
    </>
  )
}

export default Assessments;
