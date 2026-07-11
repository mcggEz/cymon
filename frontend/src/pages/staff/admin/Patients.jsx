import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import StudentAdmissionForm from './StudentAdmissionForm'

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '')

const Section = ({ title, hint, children }) => (
  <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div className="text-sm font-semibold text-purple-800">{title}</div>
    {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
)

const FORM_LABEL = { complete: 'Complete', pending: 'Pending', in_progress: 'In Progress' }

function toRow(p) {
  return {
    id: p.patient_id,
    uuid: p.id,
    name: p.name,
    first_name: p.first_name,
    middle_name: p.middle_name,
    last_name: p.last_name,
    date_of_birth: p.date_of_birth,
    rawSex: p.sex,
    rawStatus: p.status,
    age: p.age,
    sex: cap(p.sex),
    status: cap(p.status),
    tone: p.status === 'active' ? 'emerald' : 'amber',
    form: FORM_LABEL[p.admission_form_status] || p.admission_form_status,
    formTone: p.admission_form_status === 'complete' ? 'text-emerald-600' : 'text-amber-600',
  }
}

function EditPatientModal({ row, onClose, onSaved }) {
  const [f, setF] = useState({
    first_name: row.first_name || '',
    middle_name: row.middle_name || '',
    last_name: row.last_name || '',
    date_of_birth: row.date_of_birth || '',
    sex: row.rawSex || '',
    status: row.rawStatus || '',
  })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!f.first_name || !f.last_name) {
      setErr('First and last name are required.')
      return
    }
    setBusy(true)
    try {
      await api.admin.updatePatient(row.uuid, f)
      onSaved()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Edit Patient"
      subtitle={row.id}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <Button type="submit" form="edit-patient-form" size="lg" disabled={busy}>
            {busy ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form id="edit-patient-form" onSubmit={submit} className="space-y-5">
        <Section title="Child" hint="Student record">
          <Input label="First Name" tone="purple" value={f.first_name} onChange={(e) => set('first_name', e.target.value)} />
          <Input label="Middle Name (optional)" tone="purple" value={f.middle_name} onChange={(e) => set('middle_name', e.target.value)} />
          <Input label="Last Name" tone="purple" value={f.last_name} onChange={(e) => set('last_name', e.target.value)} />
          <Input label="Date of Birth" type="date" tone="purple" value={f.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
          <Select label="Sex" value={f.sex} onChange={(e) => set('sex', e.target.value)}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <Select label="Status" value={f.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </Select>
        </Section>

        {err ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
      </form>
    </Modal>
  )
}

function ProfileModal({ row, onClose, onEdit }) {
  return (
    <Modal
      title="Patient Profile"
      subtitle={row.id}
      onClose={onClose}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
          <RowAction variant="edit" className="px-4 py-1.5" onClick={() => onEdit(row)}>
            Edit
          </RowAction>
        </div>
      }
    >
        <div className="text-xs font-semibold tracking-wider text-purple-700">
          PERSONAL INFORMATION
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Full Name</div>
            <div className="font-semibold text-purple-800">{row.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Age / Sex</div>
            <div className="font-semibold text-purple-800">{row.age} / {row.sex}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[row.tone]}`}>
              {row.status}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Admission Form</div>
            <div className={`text-sm font-semibold ${row.formTone}`}>{row.form}</div>
          </div>
        </div>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          CLINICAL HISTORY
        </div>
        <p className="mt-2 text-sm text-slate-700">
          No active medical alerts. Patient is currently enrolled in the Standard SPED Program. See
          Clinical Records for latest Assessment Reports.
        </p>
    </Modal>
  )
}

function Patients() {
  const [active, setActive] = useState(null)
  const [editing, setEditing] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openAdmissionForm, setOpenAdmissionForm] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = () =>
    api.admin
      .patients()
      .then((d) => setRows(d.patients.map(toRow)))
      .catch((e) => setError(e.message))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })

  return (
    <>
      <StaffHeader title="Patient Management" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Patient Management</h1>
            <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
              Manage student records, statuses, and admission forms.
            </div>
          </div>
          <button
            onClick={() => setOpenAdmissionForm(true)}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
          >
            Open Student Admission Form
          </button>
        </div>
        {notice ? (
          <div className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
        ) : null}
        {error ? (
          <div className="mt-3 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by name or ID…"
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              Export List
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-purple-700">
                <th className="py-3 text-left">Name</th>
                <th className="py-3 text-left">Age</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-left">Admission Form</th>
                <th className="py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-3">
                        <Skeleton className="h-11 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                    No patients match your search.
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800">{r.name}</div>
                    <div className="text-xs text-slate-500">ID: {r.id}</div>
                  </td>
                  <td className="py-3">{r.age}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[r.tone]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={`py-3 font-medium ${r.formTone}`}>{r.form}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <RowAction variant="view" onClick={() => setActive(r)}>
                        View
                      </RowAction>
                      <RowAction variant="edit" onClick={() => setEditing(r)}>Edit</RowAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>

        {active ? (
          <ProfileModal
            row={active}
            onClose={() => setActive(null)}
            onEdit={(r) => {
              setActive(null)
              setEditing(r)
            }}
          />
        ) : null}
        {editing ? (
          <EditPatientModal
            row={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              setNotice('Patient updated.')
              load()
            }}
          />
        ) : null}
        {openAdmissionForm ? (
          <StudentAdmissionForm
            onSaved={() => {
              setNotice('Student registered. The parent can now sign in.')
              load()
            }}
            onClose={() => setOpenAdmissionForm(false)}
          />
        ) : null}
      </div>
    </>
  )
}

export default Patients
