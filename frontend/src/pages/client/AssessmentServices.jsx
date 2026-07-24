import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
import { api } from '../../lib/api'
import AnswerAssessment from '../staff/psychometrician/AnswerAssessment'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

function AssessmentServices() {
  const [assigned, setAssigned] = useState([])
  const [records, setRecords] = useState([])
  const [templates, setTemplates] = useState([])
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answeringForm, setAnsweringForm] = useState(null)
  const [requestedIds, setRequestedIds] = useState(new Set())

  const EXPECTED_ASSESSMENTS = [
    { code: 'CMPS:SE-FO-03', title: 'Caregiver Observation Checklist', est_minutes: 15 },
    { code: 'CMPS:SE-FO-04', title: 'Mini-Mental Status Examination', est_minutes: 20 },
    { code: 'CMPS:SE-FO-05', title: 'Child Adaptive Functioning Tool', est_minutes: 25 },
    { code: 'CMPS:SE-FO-06', title: 'Behavioral Assessment Report', est_minutes: 30 }
  ]

  const handleLoad = () => {
    setLoading(true)
    Promise.all([
      api.client.assessments(),
      api.client.getPatient()
    ]).then(([d, p]) => {
      setAssigned(d.assigned || [])
      setRecords(d.records || [])
      
      const apiTemplates = d.templates || []
      const mapped = EXPECTED_ASSESSMENTS.map((ea) => {
        const matchedApiTpl = apiTemplates.find((at) => at.code === ea.code)
        return {
          ...ea,
          id: matchedApiTpl?.id || `mock_${ea.code}`,
        }
      })
      setTemplates(mapped)
      setPatient(p.patient)
    }).catch((e) => {
      console.error('Failed to load assessments:', e)
      const fallback = EXPECTED_ASSESSMENTS.map((ea) => ({
        ...ea,
        id: `mock_${ea.code}`,
      }))
      setTemplates(fallback)
    }).finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    handleLoad()
  }, [])

  return (
    <>
      <PageHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Unified Table Container */}
        <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm min-h-[460px]">
          <div className="border-b border-purple-50 pb-4 mb-4">
            <h3 className="text-sm font-bold text-purple-950">Assessments &amp; Diagnostics Catalog</h3>
            <p className="text-[11px] text-slate-400">View diagnostic history, submit questionnaires, or request record viewings</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-100 text-xs font-bold text-purple-800 uppercase tracking-wider">
                  <th className="py-3 px-2">Document Title</th>
                  <th className="py-3 px-2">Form Code</th>
                  <th className="py-3 px-2">Due Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 px-2"><Skeleton className="h-5 w-2/3" /></td>
                      <td className="py-4 px-2"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-4 px-2"><Skeleton className="h-5 w-32" /></td>
                      <td className="py-4 px-2"><Skeleton className="h-6 w-16" rounded="rounded-full" /></td>
                      <td className="py-4 px-2 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : templates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                      No clinical assessments registered in the catalog.
                    </td>
                  </tr>
                ) : (
                  templates.map((t) => {
                    // Check if there is a completed record (submission)
                    const record = records.find((r) => r.template_id === t.id)
                    // Check if there is an active assignment
                    const assignment = assigned.find((a) => a.template_id === t.id)

                    let statusBadge = null
                    let actionCell = null
                    let dueDate = '—'
                    let isDone = false

                    if (record) {
                      isDone = true
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-205">
                          Approved &amp; Completed
                        </span>
                      )
                      
                      const isReq = requestedIds.has(t.id)
                      actionCell = isReq ? (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1">
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setRequestedIds((prev) => {
                              const next = new Set(prev)
                              next.add(t.id)
                              return next
                            })
                          }}
                          className="rounded-lg border border-purple-200 hover:bg-purple-50 text-purple-750 px-4 py-1.5 text-xs font-bold cursor-pointer shadow-sm transition-colors"
                        >
                          Request for Viewing
                        </button>
                      )
                    } else if (assignment) {
                      dueDate = assignment.due_date ? fmtDate(assignment.due_date) : '—'
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Action
                        </span>
                      )
                      actionCell = (
                        <button
                          onClick={() => setAnsweringForm(assignment)}
                          className="rounded-lg bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 text-xs font-bold cursor-pointer shadow-sm transition-colors"
                        >
                          Answer Form
                        </button>
                      )
                    } else {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Not Administered
                        </span>
                      )
                      actionCell = (
                        <span className="text-xs text-slate-400 font-medium italic">
                          No action required
                        </span>
                      )
                    }

                    const dateColor = isDone ? 'text-emerald-600 font-semibold' : 'text-slate-500'

                    return (
                      <tr key={t.id} className="hover:bg-purple-50/10 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-semibold text-slate-800">{t.title}</div>
                          {t.est_minutes ? (
                            <div className="text-xs text-slate-400 mt-0.5">Est. Time: {t.est_minutes} minutes</div>
                          ) : null}
                        </td>
                        <td className="py-3.5 px-2 text-xs text-slate-500 font-medium">{t.code}</td>
                        <td className={`py-3.5 px-2 text-xs font-medium ${dateColor}`}>{dueDate}</td>
                        <td className="py-3.5 px-2">{statusBadge}</td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex gap-2 justify-end items-center">
                            {actionCell}
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

      {answeringForm && (
        <AnswerAssessment
          isClient={true}
          prefilledPatientId={patient?.id}
          prefilledPatientName={patient ? `${patient.first_name} ${patient.last_name}` : ''}
          prefilledTemplateId={answeringForm.template_id}
          prefilledTemplateName={answeringForm.title}
          onClose={() => {
            setAnsweringForm(null)
            handleLoad()
          }}
        />
      )}
    </>
  )
}

export default AssessmentServices
