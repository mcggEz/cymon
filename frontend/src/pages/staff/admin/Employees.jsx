import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

const ROLES = [
  { value: 'psychologist', label: 'Psychologist / Clinician' },
  { value: 'psychometrician', label: 'Psychometrician (RPm)' },
  { value: 'occupational_therapist', label: 'Occupational Therapist' },
  { value: 'speech_therapist', label: 'Speech Therapist' },
  { value: 'admin', label: 'Administrator' },
]

const ROLE_META = {
  admin: { label: 'Administrator', tone: 'bg-purple-100 text-purple-700' },
  psychologist: { label: 'Psychologist', tone: 'bg-sky-100 text-sky-700' },
  psychometrician: { label: 'Psychometrician', tone: 'bg-amber-100 text-amber-700' },
  occupational_therapist: { label: 'Occupational Therapist', tone: 'bg-emerald-100 text-emerald-700' },
  speech_therapist: { label: 'Speech Therapist', tone: 'bg-rose-100 text-rose-700' },
}

const STAFF_ROLES = ['psychologist', 'psychometrician', 'occupational_therapist', 'speech_therapist']
const isStaff = (r) => STAFF_ROLES.includes(r)

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const initialsOf = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

const Section = ({ title, hint, children }) => (
  <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div className="text-sm font-semibold text-purple-800">{title}</div>
    {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
)

const empty = {
  email: '',
  password: '',
  confirm: '',
  display_name: '',
  roles: [],
  phone: '',
  employee_id: '',
  position: '',
  license_no: '',
  title: '',
}

const RoleChips = ({ role, extra = [] }) => {
  const all = [role, ...extra].filter(Boolean)
  return (
    <div className="flex flex-wrap gap-1">
      {all.map((r) => {
        const meta = ROLE_META[r] || { label: r, tone: 'bg-slate-100 text-slate-600' }
        return (
          <span key={r} className={`rounded-full px-3 py-0.5 text-xs font-semibold ${meta.tone}`}>
            {meta.label}
          </span>
        )
      })}
    </div>
  )
}

const Info = ({ label, value }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    <div className="font-medium text-purple-800">{value || '—'}</div>
  </div>
)

function EmployeeDetail({ emp, onClose, onDeactivate, onSaveRoles, onOverridePassword, busy }) {
  const [confirm, setConfirm] = useState(false)
  const [editingRoles, setEditingRoles] = useState(false)
  const [role, setRole] = useState(emp.role)
  const [extra, setExtra] = useState(emp.extra_roles || [])
  const [savingRoles, setSavingRoles] = useState(false)
  const [roleErr, setRoleErr] = useState(null)
  const isAdmin = emp.role === 'admin'

  const toggleExtra = (r) => setExtra((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))

  const startEdit = () => {
    setRoleErr(null)
    setRole(emp.role)
    setExtra(emp.extra_roles || [])
    setEditingRoles(true)
  }

  const saveRoles = async () => {
    setRoleErr(null)
    setSavingRoles(true)
    try {
      await onSaveRoles(emp.id, { role, extra_roles: extra.filter((r) => r !== role) })
      setEditingRoles(false)
    } catch (e) {
      setRoleErr(e.message)
    } finally {
      setSavingRoles(false)
    }
  }

  return (
    <>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-sm font-bold text-purple-700">
            {emp.avatar_url ? <img src={emp.avatar_url} alt="" className="h-full w-full object-cover" /> : initialsOf(emp.name)}
          </div>
          <div>
            <div className="text-lg font-bold text-purple-800">{emp.name}</div>
            <div className="text-xs text-slate-500">{emp.email}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Email" value={emp.email} />
          <Info label="Phone" value={emp.phone} />
          {isAdmin ? (
            <>
              <Info label="Employee ID" value={emp.employee_id} />
              <Info label="Position" value={emp.position} />
            </>
          ) : (
            <>
              <Info label="PRC License No." value={emp.license_no} />
              <Info label="Title" value={emp.staff_title} />
            </>
          )}
          <Info label="Joined" value={fmtDate(emp.created_at)} />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Role(s)</div>
            {!editingRoles ? (
              <button onClick={startEdit} className="text-xs font-semibold text-purple-700 hover:text-purple-900">
                Edit Roles
              </button>
            ) : null}
          </div>

          {editingRoles ? (
            <div className="mt-2 space-y-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">Primary Role</div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-700">Additional Roles</div>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ROLES.filter((r) => r.value !== role).map((r) => (
                    <label key={r.value} className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-xs">
                      <input type="checkbox" checked={extra.includes(r.value)} onChange={() => toggleExtra(r.value)} />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {roleErr ? <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{roleErr}</div> : null}
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingRoles(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={saveRoles} disabled={savingRoles} className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-60">
                  {savingRoles ? 'Saving…' : 'Save Roles'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <RoleChips role={emp.role} extra={emp.extra_roles} />
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {confirm ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">Deactivating blocks this employee from signing in. Continue?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirm(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={() => onDeactivate(emp.id)}
                  disabled={busy}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {busy ? 'Deactivating…' : 'Confirm Deactivate'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOverridePassword(emp)}
                  className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(true)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Deactivate
                </button>
              </div>
            </div>
          )}
        </div>
    </>
  )
}

function Employees() {
  const [employees, setEmployees] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState(empty)
  const [error, setError] = useState(null)
  const [passwordResetUserId, setPasswordResetUserId] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [listError, setListError] = useState(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const fileRef = useRef(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleRole = (r) =>
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
    }))

  const deactivate = async (id) => {
    setBusy(true)
    try {
      await api.admin.setEmployeeActive(id, false)
      setViewing(null)
      await loadList()
    } finally {
      setBusy(false)
    }
  }

  const saveRoles = async (id, payload) => {
    await api.admin.setEmployeeRoles(id, payload)
    const d = await api.admin.employees().catch(() => null)
    if (d) {
      setEmployees(d.employees)
      const updated = d.employees.find((e) => e.id === id)
      if (updated) setViewing(updated)
    }
  }

  const loadList = () =>
    api.admin
      .employees()
      .then((d) => {
        setEmployees(d.employees)
        setListError(null)
      })
      .catch((e) => setListError(e.message))
  useEffect(() => {
    loadList().finally(() => setLoadingList(false))
  }, [])

  const onAvatar = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.email || !form.password || !form.display_name) {
      setError('Email, password, and full name are required.')
      return
    }
    if (form.roles.length === 0) {
      setError('Select at least one role.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.roles.includes('admin') && !form.employee_id) {
      setError('Employee ID is required for administrators.')
      return
    }
    const [primaryRole, ...extraRoles] = form.roles
    setSubmitting(true)
    try {
      await api.admin.createEmployee({
        email: form.email,
        password: form.password,
        display_name: form.display_name,
        role: primaryRole,
        extra_roles: extraRoles,
        phone: form.phone,
        employee_id: form.employee_id,
        position: form.position,
        license_no: form.license_no,
        title: form.title,
        avatar,
      })
      const roleLabel = ROLES.find((r) => r.value === primaryRole)?.label || primaryRole
      toast.success(`Registered ${form.display_name} as ${roleLabel}.`)
      setForm(empty)
      setAvatar(null)
      setShowForm(false)
      await loadList()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = employees.filter((e) => {
    const matchesQ =
      !q || (e.name || '').toLowerCase().includes(q) || (e.email || '').toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || e.role === roleFilter
    return matchesQ && matchesRole
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Employees" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">Employee Management</h1>
            <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
              Registered clinicians, therapists, and administrators.
            </div>
          </div>
          <Button
            onClick={() => {
              setError(null)
              setShowForm(true)
            }}
          >
            + Register Employee
          </Button>
        </div>


        {listError ? (
          <div className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Couldn&apos;t load employees: {listError}
          </div>
        ) : null}

        {showForm ? (
          <Modal
            title="Register Employee"
            subtitle="Create a clinician, therapist, or administrator account"
            onClose={() => setShowForm(false)}
            footer={
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <Button type="submit" form="register-employee-form" size="lg" disabled={submitting}>
                  {submitting ? 'Registering…' : 'Register Employee'}
                </Button>
              </div>
            }
          >
          <form id="register-employee-form" onSubmit={submit} className="space-y-5">
            <section className="flex items-center gap-4 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-purple-700">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-purple-800">Profile Photo</div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
                >
                  {avatar ? 'Change Photo' : 'Upload Photo'}
                </button>
                <div className="mt-1 text-xs text-slate-500">JPG, PNG, or WEBP · optional</div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onAvatar}
                className="hidden"
              />
            </section>

            <Section title="Account" hint="Used to sign in to the portal">
              <Input label="Email address" type="email" tone="purple" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <Input label="Phone (optional)" tone="purple" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <Input label="Temporary Password" type="password" tone="purple" value={form.password} onChange={(e) => set('password', e.target.value)} />
              <Input label="Confirm Password" type="password" tone="purple" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
            </Section>

            <Section title="Profile" hint="Identity and role within the clinic">
              <Input label="Full Name" tone="purple" value={form.display_name} onChange={(e) => set('display_name', e.target.value)} />
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold tracking-wider text-purple-700">
                  ROLES <span className="text-slate-400">(select at least one)</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Check every role this employee holds (e.g. Psychologist + Speech Therapist).
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.roles.includes(r.value)}
                        onChange={() => toggleRole(r.value)}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Section>

            {form.roles.includes('admin') ? (
              <Section title="Administrator Details" hint="Stored on the admin profile">
                <Input label="Employee ID" tone="purple" value={form.employee_id} onChange={(e) => set('employee_id', e.target.value)} />
                <Input label="Position" tone="purple" value={form.position} onChange={(e) => set('position', e.target.value)} />
              </Section>
            ) : null}

            {form.roles.some(isStaff) ? (
              <Section title="Professional Credentials" hint="Stored on the staff record">
                <Input label="PRC License No." tone="purple" value={form.license_no} onChange={(e) => set('license_no', e.target.value)} />
                <Input label="Title (e.g. Clinical Psychologist)" tone="purple" value={form.title} onChange={(e) => set('title', e.target.value)} />
              </Section>
            ) : null}

            {error ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}
          </form>
          </Modal>
        ) : null}

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search by name or email…"
              className="flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {ROLE_META[r.value]?.label || r.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-5 flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Employee</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">License / ID</th>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Joined</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loadingList
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="py-3 px-4">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loadingList && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-sm text-slate-500">
                      {employees.length === 0
                        ? 'No employees registered yet.'
                        : 'No employees match your search.'}
                    </td>
                  </tr>
                ) : null}
                {!loadingList &&
                  pageRows.map((emp) => {
                    const isSelected = viewing && viewing.id === emp.id
                    return (
                      <tr
                        key={emp.id}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                              {emp.avatar_url ? (
                                <img src={emp.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                initialsOf(emp.name)
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{emp.name}</div>
                              <div className="text-xs text-slate-500">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <RoleChips role={emp.role} extra={emp.extra_roles} />
                        </td>
                        <td className="py-3 px-4 text-slate-700">{emp.credential || '—'}</td>
                        <td className="py-3 px-4 text-slate-700">{emp.title || '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(emp.created_at)}</td>
                        <td className="py-3 px-4">
                          <RowAction variant="view" onClick={() => setViewing(emp)}>
                            View
                          </RowAction>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
        </section>

        {viewing ? (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setViewing(null)} aria-hidden="true" />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-purple-800">Employee Details</div>
                <button onClick={() => setViewing(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>
              <EmployeeDetail
                emp={viewing}
                onClose={() => setViewing(null)}
                onDeactivate={deactivate}
                onSaveRoles={saveRoles}
                onOverridePassword={(emp) => setPasswordResetUserId({ id: emp.id, name: emp.name })}
                busy={busy}
              />
            </aside>
          </>
        ) : null}
        {passwordResetUserId ? (
          <AdminChangePasswordModal
            userId={passwordResetUserId.id}
            userName={passwordResetUserId.name}
            onClose={() => setPasswordResetUserId(null)}
            onSaved={() => {
              setPasswordResetUserId(null)
              toast.success(`Password updated for ${passwordResetUserId.name}.`)
            }}
          />
        ) : null}
        </div>
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

export default Employees
