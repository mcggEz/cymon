import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'
import { useAuth } from '../../../auth/useAuth'
import BehavioralAssessmentForm from '../psychometrician/BehavioralAssessmentForm'
import ProgressSummaryReportForm from '../psychologist/ProgressSummaryReportForm'
import AnswerAssessment from '../psychometrician/AnswerAssessment'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700 border border-amber-200' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700 border border-sky-200' },
  ready_for_review: { label: 'PENDING REVIEW', tone: 'bg-sky-100 text-sky-700 border border-sky-200 animate-pulse' },
  approved: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
}

function Approvals() {
  const { profile } = useAuth()
  const [patients, setPatients] = useState([])
  const [tests, setTests] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [reports, setReports] = useState([])
  const [activeReport, setActiveReport] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [showOnlyPending, setShowOnlyPending] = useState(false)
  const [openForm, setOpenForm] = useState(null)
  const [viewSub, setViewSub] = useState(null)
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const approvalsData = await api.psychologist.approvals()
      setSubmissions(approvalsData.submissions || [])
      
      const rosterData = await api.psychometrician.assessments()
      setPatients(rosterData.patients || [])
      setTests(rosterData.tests || [])

      const draftingData = await api.psychometrician.draftingReports()
      const combinedReports = [
        ...(approvalsData.reports || []),
        ...(draftingData.rows || [])
      ]
      setReports(combinedReports)
    } catch (e) {
      console.error(e)
      toast.error('Error loading data')
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

  // Smart auto-selection of the first patient with a pending submission
  useEffect(() => {
    if (!loading && patients.length > 0 && !selectedPatientId) {
      const pendingPatient = patients.find(p => {
        const hasPending = submissions.some(s => s.patient_id === p.id && s.status === 'submitted')
        return hasPending
      })
      setSelectedPatientId(pendingPatient ? pendingPatient.id : patients[0].id)
    }
  }, [loading, patients, submissions, selectedPatientId])

  const handleUpdateStatus = async (id, status) => {
    setBusyId(id)
    try {
      await api.psychologist.updateSubmission(id, { status })
      toast.success(status === 'scored' ? 'Assessment approved and signed.' : 'Assessment sent back for revalidation.')
      await loadData()
    } catch (e) {
      toast.error(`Error updating status: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const q = query.trim().toLowerCase()
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = !q || [p.name, p.patient_id].some((v) => (v || '').toLowerCase().includes(q))
    if (!matchesSearch) return false

    if (showOnlyPending) {
      const hasPending = submissions.some(s => s.patient_id === p.id && s.status === 'submitted')
      return hasPending
    }
    return true
  })

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const patientSubmissions = submissions.filter(s => s.patient_id === selectedPatientId)
  const patientPendingSubmissions = patientSubmissions.filter(s => s.status === 'submitted')
  const totalPendingSubmissions = submissions.filter(s => s.status === 'submitted').length

  const patientReports = selectedPatient
    ? reports.filter((r) => r.name.toLowerCase() === selectedPatient.name.toLowerCase())
    : []

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StaffHeader title="Approvals" />
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col overflow-hidden">

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
            
            {/* Left Panel: Student Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-full flex flex-col overflow-hidden">
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
                  Show only pending submissions
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
                    const patientPending = submissions.filter(s => s.patient_id === p.id && s.status === 'submitted')
                    const hasPending = patientPending.length > 0

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
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>ID: {p.patient_id || 'N/A'}</span>
                            {hasPending && (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 animate-pulse">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Student Actions */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              {selectedPatient ? (
                openForm || viewSub ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="mb-4 shrink-0">
                      <button
                        onClick={() => {
                          setOpenForm(null)
                          setViewSub(null)
                        }}
                        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 shadow-sm cursor-pointer transition-colors"
                      >
                        &larr; Back to Dashboard Tables
                      </button>
                    </div>
                    <div className="flex-1 min-h-0 rounded-2xl border border-purple-200 overflow-hidden bg-white shadow-sm">
                      {openForm === 'behavioral' && (
                        <BehavioralAssessmentForm
                          inline={true}
                          onClose={() => {
                            setOpenForm(null)
                            loadData()
                          }}
                        />
                      )}
                      {openForm === 'viewBehavioral' && activeReport && (
                        <BehavioralAssessmentForm
                          detail={activeReport}
                          readOnly={activeReport.status !== 'draft'}
                          inline={true}
                          onClose={() => {
                            setOpenForm(null)
                            loadData()
                          }}
                        />
                      )}
                      {openForm === 'viewProgress' && activeReport && (
                        <ProgressSummaryReportForm
                          detail={activeReport}
                          readOnly={activeReport.status !== 'ready_for_review'}
                          patients={patients}
                          inline={true}
                          onClose={() => {
                            setOpenForm(null)
                            loadData()
                          }}
                        />
                      )}
                      {viewSub && (
                        <AnswerAssessment
                          tests={tests}
                          patients={patients}
                          prefilledPatientId={viewSub.patient_id}
                          prefilledTemplateId={viewSub.template_id}
                          submission={viewSub}
                          readOnly={true}
                          inline={true}
                          onClose={() => setViewSub(null)}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage and approve completed standardized assessment reports for this student.
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

                  {/* Standardized Assessment Submissions Panel */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2">
                        Standardized Assessment Submissions
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100 pb-2 text-left">
                              <th className="pb-3 px-2">Assessment Tool</th>
                              <th className="pb-3 px-2">Submitter / Date</th>
                              <th className="pb-3 px-2">Status</th>
                              <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-50/40">
                            {patientSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                  No assessment submissions recorded for this student.
                                </td>
                              </tr>
                            ) : (
                              patientSubmissions.map((s) => {
                                const isBusy = busyId === s.id
                                return (
                                  <tr key={s.id} className="hover:bg-purple-50/10 transition-colors">
                                    <td className="py-3 px-2">
                                      <div className="font-semibold text-slate-800">{s.assessment_name}</div>
                                    </td>
                                    <td className="py-3 px-2 text-xs text-slate-650">
                                      <div>{s.submitted_by}</div>
                                      <div className="text-[10px] text-purple-650 font-medium">{fmtDate(s.date)}</div>
                                    </td>
                                    <td className="py-3 px-2">
                                      {s.status === 'scored' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                          Approved &amp; Signed
                                        </span>
                                      ) : s.status === 'revalidation' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-800 animate-pulse border border-rose-200">
                                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                          Revalidation Required
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 animate-pulse border border-amber-200">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                          Pending Approval
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => setViewSub(s)}
                                          className="rounded-md border border-purple-200 hover:bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                        >
                                          View Form
                                        </button>
                                        {s.status === 'submitted' && (
                                          <>
                                            <button
                                              disabled={isBusy}
                                              onClick={() => handleUpdateStatus(s.id, 'scored')}
                                              className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-semibold text-white cursor-pointer shadow-sm disabled:opacity-50"
                                            >
                                              {isBusy ? 'Saving...' : 'Approve & Sign'}
                                            </button>
                                            <button
                                              disabled={isBusy}
                                              onClick={() => handleUpdateStatus(s.id, 'revalidation')}
                                              className="rounded-md border border-rose-300 hover:bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 cursor-pointer disabled:opacity-50"
                                            >
                                              {isBusy ? 'Saving...' : 'Revalidate'}
                                            </button>
                                          </>
                                        )}
                                        {s.status === 'revalidation' && (
                                          <span className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-1 rounded-md">Sent for Revalidation</span>
                                        )}
                                        {s.status === 'scored' && (
                                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">Signed</span>
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

                  {/* Clinical Reports Ledger Panel */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2">
                        Clinical &amp; Progress Reports Ledger
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
                                  No clinical reports drafted or pending for this student.
                                </td>
                              </tr>
                            ) : (
                              patientReports.map((r) => {
                                const meta = STATUS_META[r.status] || STATUS_META.draft
                                return (
                                  <tr key={`${r.report_type || 'behavioral'}-${r.id}`} className="hover:bg-purple-50/10 transition-colors">
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
                                          if (r.report_type === 'progress_summary') {
                                            setOpenForm('viewProgress')
                                          } else {
                                            setOpenForm('viewBehavioral')
                                          }
                                        }}
                                        className="rounded-md border border-purple-200 hover:bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                      >
                                        {r.status === 'draft' || r.status === 'ready_for_review' ? 'View & Edit' : 'View Form'}
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
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-white p-12 text-center text-slate-505 shadow-sm flex flex-col items-center justify-center h-full">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to configure clinical approvals.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Approvals;
