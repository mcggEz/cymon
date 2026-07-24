import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import StudentAdmissionForm from './StudentAdmissionForm'
import StudentAdmissionDocument from './StudentAdmissionDocument'

const PAGE_SIZE = 20

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

const Field = ({ label, value }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    <div className="font-medium text-purple-800">{value || '—'}</div>
  </div>
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
    treating_psychologist_id: p.treating_psychologist_id,
    treating_psychometrician_id: p.treating_psychometrician_id,
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
    treating_psychologist_id: row.treating_psychologist_id || '',
    treating_psychometrician_id: row.treating_psychometrician_id || '',
  })
  const [employees, setEmployees] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  useEffect(() => {
    api.admin.employees()
      .then((data) => {
        setEmployees(data.employees || [])
      })
      .catch(() => {})
      .finally(() => setLoadingEmployees(false))
  }, [])

  const psychologists = employees.filter(e => e.role === 'psychologist' || (e.extra_roles || []).includes('psychologist'))
  const psychometricians = employees.filter(e => e.role === 'psychometrician' || (e.extra_roles || []).includes('psychometrician'))

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

        <Section title="Staff Assignments" hint="Assign clinical personnel responsible for this student">
          <Select
            label="Assigned Psychologist"
            value={f.treating_psychologist_id}
            onChange={(e) => set('treating_psychologist_id', e.target.value)}
            disabled={loadingEmployees}
          >
            <option value="">Unassigned</option>
            {psychologists.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
          <Select
            label="Assigned Psychometrician"
            value={f.treating_psychometrician_id}
            onChange={(e) => set('treating_psychometrician_id', e.target.value)}
            disabled={loadingEmployees}
          >
            <option value="">Unassigned</option>
            {psychometricians.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </Section>

        {err ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
      </form>
    </Modal>
  )
}

function Patients() {
  const [active, setActive] = useState(null)
  const [detail, setDetail] = useState(null)
  const [viewDoc, setViewDoc] = useState(false)
  const [editing, setEditing] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [openAdmissionForm, setOpenAdmissionForm] = useState(false)
  const [passwordResetUserId, setPasswordResetUserId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = () =>
    api.admin
      .patients()
      .then((d) => setRows(d.patients.map(toRow)))
      .catch((e) => setError(e.message))

  const openDetail = (r) => {
    setActive(r)
    setDetail(null)
    setShowDeleteConfirm(false)
    api.admin.patient(r.uuid).then(setDetail).catch(() => {})
  }
  const closeDetail = () => {
    setActive(null)
    setDetail(null)
    setViewDoc(false)
    setShowDeleteConfirm(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.admin.deletePatient(active.uuid)
      toast.success('Student record deleted permanently.')
      setActive(null)
      setDetail(null)
      setShowDeleteConfirm(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete student.')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    const ms = statusFilter === 'all' || r.status === statusFilter
    return mq && ms
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleExport = () => {
    if (!filtered || filtered.length === 0) {
      toast.error('No student records to export.')
      return
    }
    const headers = ['Student ID', 'Full Name', 'Age', 'Sex', 'Status', 'Date of Birth', 'Admission Form']
    const csvRows = filtered.map((r) => [
      r.id,
      r.name,
      r.age,
      r.sex,
      r.status,
      r.date_of_birth,
      r.form,
    ])
    const csvContent = [headers, ...csvRows]
      .map((row) => row.map((val) => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <StaffHeader title="Student Management" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Student Management</h1>
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

        {error ? (
          <div className="mt-3 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">{error}</div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search by name or ID…"
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <button
              onClick={handleExport}
              className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50 cursor-pointer"
            >
              Export List
            </button>
          </div>
        </section>

        <div className="mt-5 flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-purple-700">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Age</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="py-3 px-4">
                        <Skeleton className="h-11 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-sm text-slate-500">
                    No patients match your search.
                  </td>
                </tr>
              ) : null}
              {!loading && pageRows.map((r) => {
                const isSelected = active && active.id === r.id
                return (
                  <tr
                    key={r.id}
                    className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500">ID: {r.id}</div>
                    </td>
                    <td className="py-3 px-4">{r.age}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[r.tone]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RowAction variant="view" onClick={() => openDetail(r)}>
                          View
                        </RowAction>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
        </section>

        {active ? (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={closeDetail} aria-hidden="true" />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-purple-800">Student Details</div>
                <button onClick={closeDetail} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>

              {detail?.patient?.photo_url ? (
                <img src={detail.patient.photo_url} alt="" className="mb-3 h-24 w-24 rounded-lg object-cover ring-1 ring-purple-200" />
              ) : null}
              <div className="text-xs text-slate-500">ID: {active.id}</div>

              <div className="mt-4 text-xs font-semibold tracking-wider text-purple-700">PERSONAL INFORMATION</div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Full Name" value={detail?.patient?.full_name || active.name} />
                <Field
                  label="Age / Sex"
                  value={`${detail?.patient?.age ?? active.age} / ${cap(detail?.patient?.sex || active.rawSex)}`}
                />
                <Field label="Birthdate" value={detail?.patient?.date_of_birth} />
                <Field label="Place of Birth" value={detail?.patient?.place_of_birth} />
                <Field label="Nickname" value={detail?.patient?.nick_name} />
                <Field label="Citizenship" value={detail?.patient?.citizenship} />
                <Field label="Religion" value={detail?.patient?.religion} />
                <Field label="Status" value={active.status} />
                <div className="col-span-2">
                  <Field label="Present Address" value={detail?.patient?.home_address} />
                </div>
              </dl>

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">PARENT / GUARDIAN</div>
              {(detail?.guardians || []).length ? (
                <div className="mt-2 space-y-3 text-sm">
                  {detail.guardians.map((g) => (
                    <div key={g.id}>
                      <div className="font-semibold text-purple-800">
                        {g.full_name}{' '}
                        {g.relationship ? <span className="text-xs font-normal text-slate-500">({g.relationship})</span> : null}
                      </div>
                      <div className="text-xs text-slate-600">
                        {[g.occupation, g.contact_number, g.email].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </div>
                  ))}
                  {detail?.patient?.caregiver_id ? (
                    <button
                      onClick={() => setPasswordResetUserId({
                        id: detail.patient.caregiver_id,
                        name: detail.patient.full_name + "'s Parent"
                      })}
                      className="mt-2 text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                    >
                      🔑 Override Parent Password
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">—</p>
              )}

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">EMERGENCY CONTACT</div>
              {detail?.emergency ? (
                <div className="mt-2 text-sm">
                  <div className="font-semibold text-purple-800">
                    {detail.emergency.full_name}{' '}
                    {detail.emergency.relationship ? <span className="text-xs font-normal text-slate-500">({detail.emergency.relationship})</span> : null}
                  </div>
                  <div className="text-xs text-slate-600">{detail.emergency.contact_number || '—'}</div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">—</p>
              )}

              <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">CLINICAL & ENROLLMENT</div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Diagnosis" value={detail?.clinical?.primary_diagnosis} />
                <Field label="Disability / Impairment" value={detail?.clinical?.secondary_diagnosis} />
                <Field label="Enrollment (IEP)" value={detail?.clinical?.iep_level} />
                <Field label="Allergies" value={detail?.clinical?.allergies} />
                <Field label="Admission Form" value={active.form} />
                <Field label="Assigned Psychologist" value={detail?.patient?.treating_psychologist?.display_name || 'Unassigned'} />
                <Field label="Assigned Psychometrician" value={detail?.patient?.treating_psychometrician?.display_name || 'Unassigned'} />
              </dl>

              <div className="mt-5 border-t border-slate-100 pt-4">
                {showDeleteConfirm ? (
                  <div className="space-y-2 rounded-xl bg-red-50 p-3 border border-red-200">
                    <p className="text-xs font-bold text-red-800">Permanently delete student record?</p>
                    <p className="text-[10px] text-red-700 leading-normal">
                      This action is irreversible. It will permanently remove all logs, reports, and details associated with this student.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                      >
                        {deleting ? 'Deleting…' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewDoc(true)}
                        disabled={!detail}
                        className="flex-1 rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50 cursor-pointer text-center"
                      >
                        View as Form
                      </button>
                      <button
                        onClick={() => setEditing(active)}
                        className="flex-1 rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Delete Student Record
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </>
        ) : null}
        </div>

        {editing ? (
          <EditPatientModal
            row={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              toast.success('Patient updated.')
              load()
            }}
          />
        ) : null}
        {openAdmissionForm ? (
          <StudentAdmissionForm
            onSaved={() => {
              toast.success('Student registered. The parent can now sign in.')
              load()
            }}
            onClose={() => setOpenAdmissionForm(false)}
          />
        ) : null}
        {viewDoc && detail ? (
          <StudentAdmissionDocument detail={detail} onClose={() => setViewDoc(false)} />
        ) : null}
        {passwordResetUserId ? (
          <AdminChangePasswordModal
            userId={passwordResetUserId.id}
            userName={passwordResetUserId.name}
            onClose={() => setPasswordResetUserId(null)}
            onSaved={() => {
              setPasswordResetUserId(null)
              toast.success('Password updated successfully.')
            }}
          />
        ) : null}
      </div>
    </>
  )
}

function AdminChangePasswordModal({ userId, userName, onClose, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (password.length < 6) {
      setErr('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setErr('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await api.admin.changeUserPassword(userId, password)
      onSaved()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Override Password"
      subtitle={`Set a new temporary password for ${userName}`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <Button type="submit" form="change-user-pw-form" size="lg" disabled={busy}>
            {busy ? 'Updating…' : 'Update Password'}
          </Button>
        </div>
      }
    >
      <form id="change-user-pw-form" onSubmit={submit} className="space-y-4">
        <Input
          label="New Temporary Password"
          type="password"
          tone="purple"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          tone="purple"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {err ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
      </form>
    </Modal>
  )
}

export default Patients
