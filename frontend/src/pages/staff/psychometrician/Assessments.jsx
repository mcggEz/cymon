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

function LaunchModal({ test, patients, onClose, onAssign, assigning }) {
  const [patient, setPatient] = useState('')
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

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(patient)}
            disabled={!patient || assigning}
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

function Assessments() {
  const [active, setActive] = useState(null)
  const [requestTarget, setRequestTarget] = useState(null)
  const [tests, setTests] = useState([])
  const [patients, setPatients] = useState([])
  const [requested, setRequested] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [requesting, setRequesting] = useState(false)
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
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const assign = async (patientId) => {
    setAssigning(true)
    try {
      await api.psychometrician.assignAssessment({ patient_id: patientId, template_id: active.id })
      const pname = patients.find((p) => p.id === patientId)?.name || 'the patient'
      toast.success(`Assigned “${active.title}” to ${pname} — it now appears in their Assessment Services.`)
      setActive(null)
    } catch (e) {
      toast.error(`Could not assign: ${e.message}`)
    } finally {
      setAssigning(false)
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
  const matches = (t) => !q || [t.title, t.code, t.desc].some((v) => (v || '').toLowerCase().includes(q))
  const visibleTests = tests.filter(matches)
  const availableTests = visibleTests.filter((t) => t.active !== false)
  const unavailableTests = visibleTests.filter((t) => t.active === false)
  const visibleLogs = LOGS.filter(matches)

  return (
    <>
      <StaffHeader title="Assessment Services" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
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
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search assessments or forms…"
            className="w-72"
          />
        </div>

        <h1 className="text-2xl font-bold text-purple-800">
          <span className="underline decoration-2 underline-offset-4">Tool Library</span>
        </h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Select a tool from the library to assign and launch for a patient.
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

        {active ? (
          <LaunchModal
            test={active}
            patients={patients}
            onClose={() => setActive(null)}
            onAssign={assign}
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
          <AnswerAssessment tests={tests} patients={patients} onClose={() => setAnswerOpen(false)} />
        ) : null}
      </div>
    </>
  )
}

export default Assessments
