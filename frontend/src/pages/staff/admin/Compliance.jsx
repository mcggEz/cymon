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

const PROVISIONS = [
  {
    title: '1. Consent to Enrollment and Participation',
    body: 'I voluntarily enroll my child in the Special Education Program (SPED) of ClearMind Psychological Services (CMPS) and agree to comply with the policies, schedules, and procedures of the program.',
  },
  {
    title: '2. Authority to Provide Services',
    body: 'I authorize the SPED teachers, therapists, and clinicians of CMPS to provide developmental, behavioral, and therapeutic interventions appropriate to my child\'s needs.',
  },
  {
    title: '3. Confidentiality of Records',
    body: 'I understand that my child\'s records will be kept confidential in accordance with the Data Privacy Act of 2012 and will only be released with my written consent.',
  },
  {
    title: '4. Photo & Video Release',
    body: 'I grant permission to CMPS to use photos / videos of my child for documentation and program promotion purposes only.',
  },
  {
    title: '5. Liability Waiver',
    body: 'I acknowledge that I have read and understood the program guidelines and release CMPS from liability for incidents beyond reasonable care.',
  },
  {
    title: '6. Financial Commitment',
    body: 'I commit to the tuition, materials, and assessment fees scheduled for the SPED program and understand the refund and cancellation policy.',
  },
]

const RULES = [
  'Attendance: Regular attendance is required for steady progress.',
  'Punctuality: Arrive 10 minutes before the scheduled session.',
  'Behavior: Aggressive or disruptive behavior must be discussed with the program lead.',
  'Materials: Bring assigned materials and learning aids each session.',
  'Communication: Email or message the assigned clinician for concerns.',
  'Policy Updates: CMPS may amend the program policies; updates will be communicated in writing.',
]

const SUMMERSCAPE_PROVISIONS = [
  {
    title: '1. Consent to Enrollment and Activity Participation',
    body: 'I voluntarily enroll my child in the SummerScape Program of ClearMind Psychological Services (CMPS) and agree to comply with the guidelines, schedules, and policies of the program.',
  },
  {
    title: '2. Program Schedule and Payment Conditions',
    body: 'I acknowledge that the SummerScape Program consists of ten (10) scheduled sessions, and that missed sessions are non-transferable, non-refundable, and non-convertible to cash.',
  },
  {
    title: '3. Disclosure of Special Needs and Health Conditions',
    body: 'I affirm that I have fully disclosed all relevant medical conditions, allergies, or special behavioral needs of my child to CMPS to ensure a safe environment.',
  },
  {
    title: '4. Data Privacy and Safe Video Monitoring',
    body: 'I consent to data collection for safety and program administration under the Data Privacy Act of 2012, including CCTV monitoring in clinic play and activity areas.',
  },
  {
    title: '5. Liability Release for Recreational Outings',
    body: 'I release CMPS staff and organizers from liability for any minor accidents, slips, or falls that may occur during the play-based physical activities of the program.',
  },
]

const SUMMERSCAPE_RULES = [
  'Attendance: Arrive on time to ensure maximum engagement in group games.',
  'Safety first: Follow facilitator instructions and program play rules.',
  'Cooperation: Actively communicate with clinic specialists for updates.',
]

function WaiverViewModal({ row, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)

  const isAdmission = row.code === 'CMPS:SE-FO-01' || row.code === 'CMPS:SE-FO-13'
  const isSummerScape = row.code === 'CMPS:SE-FO-12'
  const isSPED = row.code === 'CMPS:SE-FO-02'

  useEffect(() => {
    if (isAdmission) {
      setLoading(true)
      api.admin.patient(row.sid)
        .then(setDetail)
        .catch((e) => console.error('Failed to load patient detail:', e))
        .finally(() => setLoading(false))
    }
  }, [row.sid, isAdmission])

  const sa = row.provisions_agreed || {}
  const signature = sa.signature_image || null
  const isSigned = row.status === 'submitted' || row.status === 'approved'

  const provisionsList = isSummerScape ? SUMMERSCAPE_PROVISIONS : PROVISIONS
  const rulesList = isSummerScape ? SUMMERSCAPE_RULES : RULES

  return (
    <Modal title={row.doc} subtitle={`Form: ${row.code} · Student ID: ${row.sid}`} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Status bar */}
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          isSigned 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div>
            <span className="font-bold uppercase tracking-wider text-xs mr-2 px-2 py-0.5 rounded bg-white shadow-sm border border-current">
              {row.label || (isSigned ? 'SIGNED' : 'PENDING')}
            </span>
            <span className="font-medium">
              {isSigned 
                ? `Submitted & Signed by parent on ${row.due}` 
                : 'Pending Parent Signature / Completed Form'}
            </span>
          </div>
          {isSigned && (
            <span className="text-xs text-emerald-600 font-bold">✓ Complete</span>
          )}
        </div>

        {/* Admission Form details */}
        {isAdmission && (
          <div className="space-y-5">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : detail ? (
              <>
                <section className="rounded-2xl border border-purple-100 bg-slate-50/50 p-5 space-y-3">
                  <div className="text-sm font-semibold text-purple-900 border-b border-purple-100/60 pb-2">Personal Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Last Name</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.last_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">First Name</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.first_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Middle Name</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.middle_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Birthdate</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.date_of_birth || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Sex</span>
                      <span className="font-semibold text-slate-800 text-sm capitalize">{detail.patient?.sex || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Nickname</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.nick_name || '—'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block font-medium">Present Address</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.home_address || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Citizenship</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.patient?.citizenship || '—'}</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-purple-100 bg-slate-50/50 p-5 space-y-3">
                  <div className="text-sm font-semibold text-purple-900 border-b border-purple-100/60 pb-2">Parent / Guardian Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {detail.guardians?.map((g, index) => (
                      <div key={index} className="border-l-2 border-purple-200 pl-3 space-y-1">
                        <div className="font-bold text-purple-950 text-[13px]">{g.relationship || 'Guardian'}</div>
                        <div>
                          <span className="text-slate-500 mr-1 font-medium">Full Name:</span>
                          <span className="font-semibold text-slate-800">{g.full_name || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 mr-1 font-medium">Occupation:</span>
                          <span className="font-semibold text-slate-800">{g.occupation || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 mr-1 font-medium">Contact:</span>
                          <span className="font-semibold text-slate-800">{g.contact_number || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 mr-1 font-medium">Email:</span>
                          <span className="font-semibold text-slate-800">{g.email || '—'}</span>
                        </div>
                      </div>
                    ))}
                    {(!detail.guardians || detail.guardians.length === 0) && (
                      <div className="text-slate-400 italic">No parent info registered yet.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-purple-100 bg-slate-50/50 p-5 space-y-3">
                  <div className="text-sm font-semibold text-purple-900 border-b border-purple-100/60 pb-2">Clinical Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block font-medium">Primary Diagnosis</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.clinical?.primary_diagnosis || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-medium">Disability/Impairment</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.clinical?.secondary_diagnosis || 'None'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block font-medium">Allergies</span>
                      <span className="font-semibold text-slate-800 text-sm">{detail.clinical?.allergies || 'None'}</span>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="text-center text-slate-400 italic py-6">No patient profile data available for Student ID: {row.sid}</div>
            )}
          </div>
        )}

        {/* SPED or SummerScape Consent Form clauses */}
        {(isSPED || isSummerScape) && (
          <div className="space-y-5">
            {/* Nature and Scope description */}
            <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm text-slate-700">
              <div className="font-semibold text-purple-800">Nature and Scope of the Program</div>
              <p className="mt-2 leading-relaxed">
                The {isSummerScape ? 'SummerScape' : 'Special Education (SPED)'} Program of ClearMind Psychological Services is designed
                to provide developmental, academic, and behavioral support for children. By signing this consent, the parent/caregiver agrees to the terms
                and provisions outlined below.
              </p>
            </section>

            {/* Provisions checklist */}
            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm space-y-4">
              <div className="text-base font-semibold text-purple-900 border-b border-purple-50 pb-2">
                Provisions & Agreements
              </div>
              <div className="space-y-4 mt-2">
                {provisionsList.map((p) => {
                  const key = p.title.split('.')[0]
                  const hasAgreed = isSigned && (sa[key] !== false)
                  return (
                    <div key={p.title} className="border-l-2 border-purple-300 pl-3 py-1 space-y-1">
                      <div className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        {p.title}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasAgreed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {hasAgreed ? '✓ Parent Agreed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.body}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Clinic House Rules */}
            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm space-y-3">
              <div className="text-base font-semibold text-purple-900 border-b border-purple-50 pb-2">
                Clinic House Rules
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
                {rulesList.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5">
                {isSigned ? (
                  <>✓ Parent acknowledged and agreed to abide by all house rules.</>
                ) : (
                  <span className="text-slate-400 font-normal">Parent signature will acknowledge agreement to abide by these rules.</span>
                )}
              </div>
            </section>
          </div>
        )}

        {/* E-Signature and Acknowledgement fields block */}
        <section className="rounded-2xl border border-purple-100 bg-slate-50/50 p-5 space-y-4">
          <div className="text-sm font-semibold text-purple-900 border-b border-purple-100/60 pb-2">
            Parent / Guardian Signatures
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Parent / Guardian Name</span>
              <span className="font-bold text-slate-800 text-sm">{sa.parent_name || row.signature_text || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Signed Date</span>
              <span className="font-bold text-slate-800 text-sm">
                {sa.date ? fmtDue(sa.date) : (row.signed_at ? fmtDue(row.signed_at) : '—')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Student Name</span>
              <span className="font-bold text-slate-800 text-sm">{sa.child_name || row.student || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Relationship</span>
              <span className="font-bold text-slate-800 text-sm">{sa.relationship || '—'}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-slate-500 font-medium mb-1.5">E-Signature Image</div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex justify-center max-w-md">
              {signature ? (
                <img src={signature} alt="Parent Signature" className="max-h-24 object-contain mx-auto" />
              ) : (
                <span className="text-xs text-slate-400 italic">No signature image available (form not signed yet)</span>
              )}
            </div>
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
                          isSelected ? 'border-purple-300 bg-purple-100 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm flex items-center gap-1.5 ${
                            isSelected ? 'text-purple-900' : 'text-slate-800'
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
                                      <button
                                        onClick={() => setViewWaiver(w)}
                                        className="rounded-md border border-purple-200 hover:bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 cursor-pointer shadow-sm transition-colors"
                                      >
                                        View Form
                                      </button>
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
