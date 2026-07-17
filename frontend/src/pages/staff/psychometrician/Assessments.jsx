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

const LOGS = [
  {
    id: 'dal',
    code: 'CMPS:SE-FO-07',
    title: 'Daily Activity Logging',
    desc:
      "Log daily session procedures, required prompts, and behavioral responses for the student's active session.",
    duration: 'Post-Session',
  },
]

function LaunchModal({ test, patients, employees, onClose, onAssign, assigning }) {
  const [patient, setPatient] = useState('')
  const [employee, setEmployee] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-purple-800">Assign Assessment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Assigning: <span className="font-medium text-purple-700">{test.title}</span>
        </p>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">SELECT PATIENT</div>
        <select
          className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
        >
          <option value="">-- Choose Patient --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">ASSIGN TO CLINIC PROFESSIONAL</div>
        <select
          className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
        >
          <option value="">-- Choose Professional --</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(patient, employee)}
            disabled={!patient || !employee || assigning}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RequestModal({ test, onClose, onSubmit, submitting }) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-purple-800">Request Activation</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ask Admin to make <span className="font-medium text-purple-700">{test.title}</span> available.
        </p>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">NOTE (OPTIONAL)</div>
        <textarea
          className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
          rows={3}
          placeholder="e.g. Needed for an incoming patient's evaluation."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note)}
            disabled={submitting}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolCard({ t, onLaunch, onRequest, requested, half = false }) {
  const available = t.active !== false
  return (
    <article className={`rounded-2xl border border-purple-200 bg-white p-5 shadow-sm ${half ? '' : 'sm:max-w-md'}`}>
      <div className="flex items-start justify-end">
        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-purple-700">
          {t.code}
        </span>
      </div>
      <div className="mt-3 text-base font-semibold text-purple-800">{t.title}</div>
      <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">{t.duration}</span>
        {available ? (
          <button
            onClick={onLaunch}
            className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800"
          >
            Launch Tool
          </button>
        ) : requested ? (
          <span className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            Requested
          </span>
        ) : (
          <button
            onClick={onRequest}
            className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
          >
            Request Activation
          </button>
        )}
      </div>
    </article>
  )
}

function RosterAssignModal({ patient, tests, employees, onClose, onAssign, assigning }) {
  const [testId, setTestId] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-purple-800">Assign Assessment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Assigning for student: <span className="font-medium text-purple-700">{patient.name}</span>
        </p>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">SELECT ASSESSMENT TOOL</div>
        <select
          className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
        >
          <option value="">-- Choose Assessment --</option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.code})
            </option>
          ))}
        </select>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">ASSIGN TO CLINIC PROFESSIONAL</div>
        <select
          className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">-- Choose Professional --</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(patient.id, testId, employeeId)}
            disabled={!testId || !employeeId || assigning}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Assessments() {
  const [activeTab, setActiveTab] = useState('roster')
  const [active, setActive] = useState(null)
  const [requestTarget, setRequestTarget] = useState(null)
  const [rosterPatientTarget, setRosterPatientTarget] = useState(null)
  const [tests, setTests] = useState([])
  const [patients, setPatients] = useState([])
  const [employees, setEmployees] = useState([])
  const [requested, setRequested] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestingPermId, setRequestingPermId] = useState(null)
  const [query, setQuery] = useState('')
  const [openForm, setOpenForm] = useState(null)
  const [answerOpen, setAnswerOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let on = true
    api.psychometrician
      .assessments()
      .then((d) => {
        if (!on) return
        setTests(d.tests)
        setPatients(d.patients)
        setEmployees(d.employees || [])
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const assign = async (patientId, employeeId) => {
    setAssigning(true)
    try {
      await api.psychometrician.assignAssessment({
        patient_id: patientId,
        template_id: active.id,
        assigned_to_id: employeeId,
      })
      toast.success(`Assigned “${active.title}” successfully.`)
      setActive(null)
    } catch (e) {
      toast.error(`Could not assign: ${e.message}`)
    } finally {
      setAssigning(false)
    }
  }

  const rosterAssign = async (patientId, testId, employeeId) => {
    setAssigning(true)
    try {
      const selectedTest = tests.find((t) => t.id === testId)
      await api.psychometrician.assignAssessment({
        patient_id: patientId,
        template_id: testId,
        assigned_to_id: employeeId,
      })
      toast.success(`Assigned “${selectedTest?.title}” successfully.`)
      setRosterPatientTarget(null)
    } catch (e) {
      toast.error(`Could not assign: ${e.message}`)
    } finally {
      setAssigning(false)
    }
  }

  const handleRequestPermission = async (patientId) => {
    setRequestingPermId(patientId)
    try {
      await api.psychometrician.requestAssessmentPermission({ patient_id: patientId })
      toast.success('Assessment permission requested from Psychologist.')
      const d = await api.psychometrician.assessments()
      setPatients(d.patients)
    } catch (e) {
      toast.error(`Could not request permission: ${e.message}`)
    } finally {
      setRequestingPermId(null)
    }
  }

  const submitRequest = async (note) => {
    setRequesting(true)
    try {
      await api.psychometrician.requestAssessment({ template_id: requestTarget.id, note })
      setRequested((ids) => [...ids, requestTarget.id])
      toast.success(`Requested “${requestTarget.title}” — Admin will review and activate it.`)
      setRequestTarget(null)
    } catch (e) {
      toast.error(`Could not request: ${e.message}`)
    } finally {
      setRequesting(false)
    }
  }

  const q = query.trim().toLowerCase()
  const matchesTest = (t) => !q || [t.title, t.code, t.desc].some((v) => (v || '').toLowerCase().includes(q))
  const matchesPatient = (p) => !q || [p.name, p.patient_id].some((v) => (v || '').toLowerCase().includes(q))

  const visibleTests = tests.filter(matchesTest)
  const availableTests = visibleTests.filter((t) => t.active !== false)
  const unavailableTests = visibleTests.filter((t) => t.active === false)
  const visibleLogs = LOGS.filter(matchesTest)

  const visiblePatients = patients.filter(matchesPatient)
  const authorizedPatients = patients.filter((p) => p.permission === 'granted')

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-purple-200">
            <button
              onClick={() => {
                setActiveTab('roster')
                setQuery('')
              }}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'roster'
                  ? 'border-purple-700 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-purple-700'
              }`}
            >
              Student Roster & Permissions
            </button>
            <button
              onClick={() => {
                setActiveTab('tools')
                setQuery('')
              }}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'tools'
                  ? 'border-purple-700 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-purple-700'
              }`}
            >
              Assessment Tools Library
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'tools' && (
              <>
                <button
                  onClick={() => setOpenForm('mmse')}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                >
                  Open MMSE Form
                </button>
                <button
                  onClick={() => setOpenForm('adaptive')}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                >
                  Open Adaptive Functioning Form
                </button>
                <button
                  onClick={() => setOpenForm('caregiver')}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                >
                  Open Caregiver Checklist
                </button>
                <button
                  onClick={() => setAnswerOpen(true)}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                >
                  Administer Assessment
                </button>
              </>
            )}
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={activeTab === 'roster' ? "Search students…" : "Search assessments…"}
              className="w-72"
            />
          </div>
        </div>

        {activeTab === 'roster' ? (
          <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-purple-800 mb-4">Student Assessment Authorization</h2>
            <p className="text-sm text-slate-600 mb-6">
              Below is the list of patients under your clinic. You must obtain permission from a Clinical Psychologist before administering any standardized tests to a student.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-100 text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50/50">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Permission Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-4 px-4"><Skeleton className="h-6 w-28 rounded-full" /></td>
                        <td className="py-4 px-4 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-md" /></td>
                      </tr>
                    ))
                  ) : visiblePatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                        {q ? 'No students match your search.' : 'No students found.'}
                      </td>
                    </tr>
                  ) : (
                    visiblePatients.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-950">{p.name}</td>
                        <td className="py-4 px-4 text-sm text-slate-600 font-mono">{p.patient_id || '—'}</td>
                        <td className="py-4 px-4 text-sm">
                          {p.permission === 'granted' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Authorized
                            </span>
                          ) : p.permission === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Pending Approval
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              No Permission
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {p.permission === 'granted' ? (
                            <button
                              onClick={() => setRosterPatientTarget(p)}
                              className="rounded-md bg-purple-700 hover:bg-purple-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-sm"
                            >
                              Assign Assessment
                            </button>
                          ) : p.permission === 'pending' ? (
                            <button
                              disabled
                              className="rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 cursor-not-allowed opacity-80"
                            >
                              Waiting for Approval
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRequestPermission(p.id)}
                              disabled={requestingPermId === p.id}
                              className="rounded-md border border-purple-300 hover:bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 transition-all"
                            >
                              {requestingPermId === p.id ? 'Requesting…' : 'Request Permission'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-purple-800">
              <span className="underline decoration-2 underline-offset-4">Tool Library</span>
            </h1>
            <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
              Select a tool from the library to assign and launch for an authorized patient.
            </div>

            <div className="mt-6 text-xs font-semibold tracking-wider text-purple-700">
              STANDARDIZED TESTS
            </div>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" rounded="rounded-2xl" />
                  ))
                : availableTests.map((t) => (
                    <ToolCard key={t.id} t={t} half onLaunch={() => setActive(t)} />
                  ))}
              {!loading && q && availableTests.length === 0 ? (
                <p className="text-sm text-slate-500">No available tests match your search.</p>
              ) : null}
            </div>

            {!loading && unavailableTests.length > 0 ? (
              <>
                <div className="mt-6 text-xs font-semibold tracking-wider text-purple-700">
                  NOT YET AVAILABLE
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Ask Admin to activate these before you can assign them.
                </div>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {unavailableTests.map((t) => (
                    <ToolCard
                      key={t.id}
                      t={t}
                      half
                      requested={requested.includes(t.id)}
                      onRequest={() => setRequestTarget(t)}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {visibleLogs.length > 0 ? (
              <>
                <div className="mt-6 text-xs font-semibold tracking-wider text-purple-700">
                  SESSION LOGS & OBSERVATIONS
                </div>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visibleLogs.map((t) => (
                    <ToolCard key={t.id} t={t} half onLaunch={() => navigate('/psychometrician/activity')} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}

        {active ? (
          <LaunchModal
            test={active}
            patients={authorizedPatients}
            employees={employees}
            onClose={() => setActive(null)}
            onAssign={assign}
            assigning={assigning}
          />
        ) : null}

        {rosterPatientTarget ? (
          <RosterAssignModal
            patient={rosterPatientTarget}
            tests={tests.filter((t) => t.active !== false)}
            employees={employees}
            onClose={() => setRosterPatientTarget(null)}
            onAssign={rosterAssign}
            assigning={assigning}
          />
        ) : null}

        {requestTarget ? (
          <RequestModal
            test={requestTarget}
            onClose={() => setRequestTarget(null)}
            onSubmit={submitRequest}
            submitting={requesting}
          />
        ) : null}

        {openForm === 'mmse' ? <MmseForm onClose={() => setOpenForm(null)} /> : null}
        {openForm === 'adaptive' ? (
          <AdaptiveFunctioningForm onClose={() => setOpenForm(null)} />
        ) : null}
        {openForm === 'caregiver' ? (
          <CaregiverChecklistForm onClose={() => setOpenForm(null)} />
        ) : null}
        {answerOpen ? (
          <AnswerAssessment tests={tests} patients={authorizedPatients} onClose={() => setAnswerOpen(false)} />
        ) : null}
      </div>
    </>
  )
}

export default Assessments;
