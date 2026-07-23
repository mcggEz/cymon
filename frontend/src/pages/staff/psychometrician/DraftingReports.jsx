import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Pagination from '../../../components/ui/Pagination'
import RowAction from '../../../components/ui/RowAction'
import BehavioralAssessmentForm from './BehavioralAssessmentForm'
import ProgressSummaryReportForm from '../psychologist/ProgressSummaryReportForm'

const PAGE_SIZE = 20

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700' },
  approved: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')

const Stat = ({ value, label, loading }) => (
  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-slate-800">{value}</div>}
    <div className="text-xs font-medium text-slate-600">{label}</div>
  </div>
)

function DraftingReports() {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [activeReport, setActiveReport] = useState(null)

  const loadData = () => {
    setLoading(true)
    api.psychometrician
      .draftingReports()
      .then((d) => {
        setRows(d.rows)
        setSummary(d.summary)
        setPatients(d.patients || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const q = query.trim().toLowerCase()
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = !q || p.name.toLowerCase().includes(q)
    return matchesSearch
  })

  // Auto-select the first student from the filtered list if none is selected
  useEffect(() => {
    if (!loading && filteredPatients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(filteredPatients[0].id)
    }
  }, [loading, filteredPatients, selectedPatientId])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const patientReports = selectedPatient
    ? rows.filter(
        (r) =>
          r.name.toLowerCase() === selectedPatient.name.toLowerCase() &&
          (statusFilter === 'all' || r.status === statusFilter)
      )
    : []

  return (
    <>
      <StaffHeader title="Behavioral Reports" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Behavioral Assessment Reports</h1>
              <p className="text-xs text-slate-500 mt-1">
                Draft, review, and complete clinical behavioral assessment reports (CMPS:SE-FO-06) for SPED students.
              </p>
            </div>
            {selectedPatient && (
              <button
                onClick={() => setOpenForm('behavioral')}
                className="rounded-md bg-purple-700 hover:bg-purple-800 px-4.5 py-2 text-sm font-semibold text-white cursor-pointer shadow-sm transition-all"
              >
                + Write Behavioral Assessment Report
              </button>
            )}
          </div>

          {/* Stats Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat value={summary?.draft ?? '—'} label="Draft" loading={loading} />
            <Stat value={summary?.submitted ?? '—'} label="Submitted" loading={loading} />
            <Stat value={summary?.approved ?? '—'} label="Approved" loading={loading} />
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Panel: Student Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[600px] flex flex-col">
              <div className="border-b border-purple-100 pb-3 shrink-0">
                <h2 className="text-sm font-semibold text-purple-800">Student Directory</h2>
                <div className="mt-3">
                  <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Search students…"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse bg-slate-100 rounded-xl" />
                  ))
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">No students found.</div>
                ) : (
                  filteredPatients.map((p) => {
                    const isSelected = selectedPatientId === p.id
                    const studentReports = rows.filter((r) => r.name.toLowerCase() === p.name.toLowerCase())
                    const draftsCount = studentReports.filter((r) => r.status === 'draft').length
                    const isPendingSign = studentReports.filter((r) => r.status === 'submitted').length > 0

                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isSelected ? 'border-purple-300 bg-purple-50/40 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm flex items-center gap-1.5 ${
                            isSelected ? 'text-purple-800' : 'text-slate-800'
                          }`}>
                            <span>{p.name}</span>
                            {isPendingSign && (
                              <span className="h-2 w-2 rounded-full bg-amber-500" title="Pending Psychologist review" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>Reports: {studentReports.length}</span>
                            {draftsCount > 0 && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                                {draftsCount} Draft
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold group-hover:underline text-[10px] uppercase text-purple-600 shrink-0 ml-2">
                          Select &rarr;
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Student Reports Checklist */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  {/* Selected Student details */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">{selectedPatient.name}</h1>
                        <p className="text-xs text-slate-500 mt-1">
                          View drafts and finalized behavioral assessment reports for this student.
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="h-9 rounded-md border border-purple-200 bg-white px-3 text-xs font-semibold text-purple-700 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Statuses</option>
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Reports list */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm min-h-[400px]">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-4">
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
                              <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                                No behavioral assessment reports found matching this criteria.
                              </td>
                            </tr>
                          ) : (
                            patientReports.map((r) => {
                              const meta = STATUS_META[r.status] || STATUS_META.draft
                              return (
                                <tr key={`${r.type}-${r.id}`} className="hover:bg-purple-50/10 transition-colors">
                                  <td className="py-3.5 px-2 font-medium text-slate-800">{r.title}</td>
                                  <td className="py-3.5 px-2 text-xs text-slate-500">{fmtDate(r.date)}</td>
                                  <td className="py-3.5 px-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.tone}`}>
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-2 text-right">
                                    <button
                                      onClick={() => {
                                        setActiveReport(r)
                                        setOpenForm('viewBehavioral')
                                      }}
                                      className="rounded-md border border-purple-200 hover:bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
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
                </>
              ) : (
                <div className="rounded-2xl border border-purple-200 bg-white p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center">
                  <svg className="h-16 w-16 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                    />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to track report drafts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openForm === 'behavioral' ? <BehavioralAssessmentForm onClose={() => setOpenForm(null)} /> : null}
      {openForm === 'viewBehavioral' && activeReport ? (
        <BehavioralAssessmentForm
          detail={activeReport}
          readOnly={activeReport.status !== 'draft'}
          onClose={() => {
            setOpenForm(null)
            loadData()
          }}
        />
      ) : null}
    </>
  )
}

export default DraftingReports
