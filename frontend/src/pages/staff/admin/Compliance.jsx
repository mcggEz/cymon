import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import Modal from '../../../components/ui/Modal'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

const TABS = ['All Issues', 'Overdue', 'Pending Signature', 'Submitted', 'Approved', 'SPED (FO-02)', 'SummerScape (FO-13)']

const tone = {
  rose: 'text-rose-700',
  amber: 'text-amber-700',
  emerald: 'text-emerald-700',
}

const STATUS_LABEL = { overdue: 'OVERDUE', pending_signature: 'PENDING SIG.', submitted: 'SUBMITTED', approved: 'APPROVED' }
const fmtDue = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function toRow(r) {
  const statusTone = r.status === 'overdue' ? 'rose' : (r.status === 'submitted' || r.status === 'approved' ? 'emerald' : 'amber')
  return {
    ...r,
    due: fmtDue(r.due_date),
    label: STATUS_LABEL[r.status] || r.status,
    tone: statusTone,
  }
}

function WaiverViewModal({ row, onClose }) {
  const sa = row.provisions_agreed || {}
  const signature = sa.signature_image || null

  return (
    <Modal title={row.doc} subtitle={`Form: ${row.code} · Student ID: ${row.sid}`} onClose={onClose}>
      <div className="space-y-5">
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm">
          <div className="font-semibold text-purple-800">Acknowledgement Summary</div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Parent / Guardian Name</span>
              <span className="font-bold text-slate-800">{sa.parent_name || row.signature_text || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Signed Date</span>
              <span className="font-bold text-slate-800">
                {sa.date ? fmtDue(sa.date) : (row.signed_at ? fmtDue(row.signed_at) : '—')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Student Name</span>
              <span className="font-bold text-slate-800">{sa.child_name || row.student || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Relationship</span>
              <span className="font-bold text-slate-800">{sa.relationship || '—'}</span>
            </div>
          </div>
        </section>

        {row.code !== 'CMPS:SE-FO-01' && row.code !== 'CMPS:SE-FO-13' && (
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-2">
            <div className="font-semibold text-purple-800 text-sm">Agreements & Provisions</div>
            <p className="text-xs text-slate-600">
              The parent agreed to the nature of the program, authority to provide services, confidentiality guidelines, health and safety policies, and financial commitments.
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded px-2.5 py-1 inline-flex items-center gap-1.5">
              ✓ Agreed to all clauses & house rules
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="font-semibold text-purple-800 text-sm">E-Signature Image</div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 flex justify-center">
            {signature ? (
              <img src={signature} alt="Parent Signature" className="max-h-28 object-contain mx-auto" />
            ) : (
              <span className="text-xs text-slate-400 italic">No signature image available</span>
            )}
          </div>
        </section>
      </div>
    </Modal>
  )
}

const Stat = ({ value, label, color }) => (
  <div className={`rounded-2xl border border-purple-200 bg-white p-5 text-center shadow-sm`}>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
  </div>
)

function Compliance() {
  const [tab, setTab] = useState('All Issues')
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [selectedStudentSid, setSelectedStudentSid] = useState('')
  const [viewWaiver, setViewWaiver] = useState(null)

  const load = () => api.admin.compliance().then(setData).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const remind = async (r) => {
    setBusyId(r.id)
    try {
      await api.admin.remindCompliance(r.id)
      toast.success(`Reminder sent to ${r.parent} about ${r.student}'s ${r.doc}.`)
    } catch (e) {
      toast.error(`Could not send reminder: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const markProcessed = async (r) => {
    setBusyId(r.id)
    try {
      await api.admin.processCompliance(r.id)
      toast.success(`Marked ${r.student}'s ${r.doc} as received.`)
      await load()
    } catch (e) {
      toast.error(`Could not process: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const rows = (data?.rows || []).map(toRow)

  // Group rows by student to check status criteria
  const studentMap = {}
  rows.forEach((r) => {
    if (!studentMap[r.sid]) {
      studentMap[r.sid] = {
        sid: r.sid,
        name: r.student,
        parent: r.parent,
        email: r.email,
        waivers: [],
      }
    }
    studentMap[r.sid].waivers.push(r)
  })

  const studentsList = Object.values(studentMap)

  // Filter students list by selected Tab and Search Query
  const foMatch = tab.match(/FO-\d+/)
  const q = query.trim().toLowerCase()

  const filteredStudents = studentsList.filter((s) => {
    const matchesQuery =
      !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.parent || '').toLowerCase().includes(q) ||
      (s.sid || '').toLowerCase().includes(q)

    if (!matchesQuery) return false

    if (tab === 'All Issues') return true
    if (tab === 'Overdue') return s.waivers.some((w) => w.status === 'overdue')
    if (tab === 'Pending Signature') return s.waivers.some((w) => w.status === 'pending_signature')
    if (tab === 'Submitted') return s.waivers.some((w) => w.status === 'submitted')
    if (tab === 'Approved') return s.waivers.some((w) => w.status === 'approved')
    if (foMatch) return s.waivers.some((w) => (w.code || '').includes(foMatch[0]))
    return true
  })

  // Auto-select the first student from the filtered list if none is selected
  useEffect(() => {
    if (!loading && filteredStudents.length > 0) {
      const alreadySelected = filteredStudents.some((s) => s.sid === selectedStudentSid)
      if (!alreadySelected) {
        setSelectedStudentSid(filteredStudents[0].sid)
      }
    } else if (!loading && filteredStudents.length === 0) {
      setSelectedStudentSid('')
    }
  }, [loading, filteredStudents, selectedStudentSid])

  const EXPECTED_FORMS = [
    { code: 'CMPS:SE-FO-01', title: 'Student Admission Form' },
    { code: 'CMPS:SE-FO-02', title: 'SPED Consent and Waiver' },
    { code: 'CMPS:SE-FO-12', title: 'SummerScape Waiver' },
    { code: 'CMPS:SE-FO-13', title: 'SummerScape Enrollment' }
  ]

  const selectedStudent = studentMap[selectedStudentSid]
  const selectedStudentWaivers = selectedStudent
    ? EXPECTED_FORMS.map((f) => {
        const existing = selectedStudent.waivers.find((w) => w.code === f.code)
        if (existing) {
          return existing
        }
        return {
          id: `mock_${selectedStudentSid}_${f.code}`,
          student: selectedStudent.name,
          sid: selectedStudent.sid,
          parent: selectedStudent.parent,
          email: selectedStudent.email,
          doc: f.title,
          code: f.code,
          due_date: null,
          status: 'not_started',
          provisions_agreed: null,
          signature_text: null,
          signed_at: null,
          due: '—',
          label: 'NOT STARTED',
          tone: 'slate',
        }
      })
    : []

  return (
    <>
      <StaffHeader title="Compliance &amp; Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">Compliance &amp; Waiver Tracking</h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor student registration forms, parent consent waivers, and signature status.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-purple-100 pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setSelectedStudentSid('')
                }}
                className={[
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all',
                  tab === t ? 'bg-purple-700 text-white shadow-sm' : 'text-purple-700 hover:bg-purple-50',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setSelectedStudentSid('')
              }}
              placeholder="Search students…"
              className="ml-auto w-64"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Panel: Student Directory */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[600px] flex flex-col">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Student Directory
              </h2>
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 w-full animate-pulse bg-slate-100 rounded-xl" />
                  ))
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">No students found.</div>
                ) : (
                  filteredStudents.map((s) => {
                    const isSelected = selectedStudentSid === s.sid
                    const hasOverdue = s.waivers.some((w) => w.status === 'overdue')
                    const hasPendingSig = s.waivers.some((w) => w.status === 'pending_signature')
                    return (
                      <button
                        key={s.sid}
                        onClick={() => setSelectedStudentSid(s.sid)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isSelected ? 'border-purple-300 bg-purple-50/40 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm flex items-center gap-1.5 ${
                            isSelected ? 'text-purple-800' : 'text-slate-800'
                          }`}>
                            <span>{s.name}</span>
                            {hasOverdue ? (
                              <span className="h-2 w-2 rounded-full bg-rose-500" title="Has Overdue Waivers" />
                            ) : hasPendingSig ? (
                              <span className="h-2 w-2 rounded-full bg-amber-500" title="Has Pending Signatures" />
                            ) : null}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">ID: {s.sid}</div>
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

            {/* Right Panel: Selected Student Details & Waivers */}
            <div className="lg:col-span-2 space-y-6">
              {selectedStudent ? (
                <>
                  {/* Student Summary Card */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">{selectedStudent.name}</h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Parent/Guardian: <span className="font-semibold text-slate-700">{selectedStudent.parent}</span>
                          {selectedStudent.email && (
                            <>
                              {' '}
                              · Email: <span className="font-semibold text-slate-700">{selectedStudent.email}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700">
                          Student ID: {selectedStudent.sid}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Waivers List Table */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm min-h-[460px]">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-4">
                      Waivers &amp; Consent Forms
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100 pb-2 text-left">
                            <th className="pb-3 px-2">Document Title</th>
                            <th className="pb-3 px-2">Form Code</th>
                            <th className="pb-3 px-2">Due Date</th>
                            <th className="pb-3 px-2">Status</th>
                            <th className="pb-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {selectedStudentWaivers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                No waivers tracked for this student.
                              </td>
                            </tr>
                          ) : (
                            selectedStudentWaivers.map((w) => {
                              const isBusy = busyId === w.id
                              return (
                                <tr key={w.id} className="hover:bg-purple-50/10 transition-colors">
                                  <td className="py-3.5 px-2 font-medium text-slate-800">{w.doc}</td>
                                  <td className="py-3.5 px-2 text-xs text-slate-500">{w.code}</td>
                                  <td className={`py-3.5 px-2 text-xs font-semibold ${tone[w.tone]}`}>{w.due}</td>
                                  <td className="py-3.5 px-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                        w.status === 'approved'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : w.status === 'submitted'
                                            ? 'bg-sky-100 text-sky-800'
                                            : w.status === 'overdue'
                                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                                              : w.status === 'not_started'
                                                ? 'bg-slate-100 text-slate-600'
                                                : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {w.label}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-2 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {(w.status === 'submitted' || w.status === 'approved') && (
                                        <button
                                          onClick={() => setViewWaiver(w)}
                                          className="rounded-md border border-purple-200 hover:bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                        >
                                          View Signed
                                        </button>
                                      )}
                                      <button
                                        onClick={() => remind(w)}
                                        disabled={isBusy || w.status === 'not_started'}
                                        className="rounded-md border border-purple-200 hover:bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 cursor-pointer disabled:opacity-50 transition-colors"
                                      >
                                        Remind
                                      </button>
                                      <button
                                        onClick={() => markProcessed(w)}
                                        disabled={isBusy || w.status === 'approved' || w.status === 'not_started'}
                                        className="rounded-md bg-purple-700 hover:bg-purple-800 text-white px-2.5 py-1 text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50 transition-colors"
                                      >
                                        {w.status === 'approved' ? 'Processed' : isBusy ? '…' : 'Process'}
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
                  <p className="mt-4 text-sm font-medium">Please select a student from the directory to track compliance forms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {viewWaiver ? <WaiverViewModal row={viewWaiver} onClose={() => setViewWaiver(null)} /> : null}
    </>
  )
}

export default Compliance
