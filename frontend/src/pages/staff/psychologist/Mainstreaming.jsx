import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import { api } from '../../../lib/api'

const STATUS_META = {
  not_ready: { label: 'Needs More Support', tone: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
  approaching: { label: 'Approaching Readiness', tone: 'bg-sky-100 text-sky-700', bar: 'bg-blue-500' },
  ready: { label: 'Ready for Transition', tone: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
}

function AssessmentModal({ patients, preset, onClose, onCreated }) {
  const [f, setF] = useState({ patient_id: preset?.patient_id || '', readiness_score: '', status: 'not_ready', notes: '' })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!f.patient_id) {
      setErr('Please choose a student.')
      return
    }
    setBusy(true)
    try {
      await api.psychologist.addMainstreaming(f)
      onCreated()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Record Mainstreaming Assessment"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <Button type="submit" form="mainstreaming-form" size="lg" disabled={busy}>
            {busy ? 'Saving…' : 'Save Assessment'}
          </Button>
        </div>
      }
    >
      <form id="mainstreaming-form" onSubmit={submit} className="space-y-4">
        <Select label="Student" value={f.patient_id} onChange={set('patient_id')} disabled={!!preset}>
          <option value="">Select a student…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Readiness Score (0–100)" type="number" tone="purple" value={f.readiness_score} onChange={set('readiness_score')} />
          <Select label="Status" value={f.status} onChange={set('status')}>
            <option value="not_ready">Needs More Support</option>
            <option value="approaching">Approaching Readiness</option>
            <option value="ready">Ready for Transition</option>
          </Select>
        </div>
        <label className="block text-sm">
          <div className="font-semibold text-purple-700">Notes</div>
          <textarea
            rows={3}
            value={f.notes}
            onChange={set('notes')}
            className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
            placeholder="Basis for the readiness rating…"
          />
        </label>
        {err ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
      </form>
    </Modal>
  )
}

function Mainstreaming() {
  const [students, setStudents] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = () =>
    api.psychologist
      .mainstreaming()
      .then((d) => {
        setStudents(d.students)
        setPatients(d.patients || [])
      })
      .catch(() => {})

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? students.filter((s) => s.name.toLowerCase().includes(q) || (s.level || '').toLowerCase().includes(q))
    : students

  return (
    <>
      <StaffHeader title="Mainstreaming" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 rounded-xl bg-purple-100 px-4 py-3 text-sm text-purple-900">
            <div className="font-semibold">📈 Mainstreaming Readiness Tracker</div>
            <div className="text-xs text-purple-700">
              Monitor each student&apos;s progress toward transitioning to regular schooling based on
              accumulated assessment scores.
            </div>
          </div>
          <Button onClick={() => setModal('new')}>+ New Assessment</Button>
        </div>

        {notice ? (
          <div className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search students by name or level…"
          />
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              {q ? 'No students match your search.' : 'No mainstreaming assessments yet.'}
            </div>
          ) : null}
          {!loading && visible.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.not_ready
            return (
            <article key={s.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.level}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <span>Mainstreaming Readiness Score</span>
                <span className="text-sm font-semibold text-slate-800">{s.score}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-purple-100">
                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${s.score}%` }} />
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setModal({ patient_id: s.patient_id })}
                  className="w-full rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
                >
                  ✏ Update Assessment
                </button>
              </div>
            </article>
            )
          })}
        </div>

      </div>

      {modal ? (
        <AssessmentModal
          patients={patients}
          preset={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onCreated={() => {
            setModal(null)
            setNotice('Mainstreaming assessment saved.')
            load()
          }}
        />
      ) : null}
    </>
  )
}

export default Mainstreaming
