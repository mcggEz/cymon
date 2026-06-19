import { useRef, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import { api } from '../../../lib/api'

const ROLES = [
  { value: 'psychologist', label: 'Psychologist / Clinician' },
  { value: 'psychometrician', label: 'Psychometrician (RPm)' },
  { value: 'occupational_therapist', label: 'Occupational Therapist' },
  { value: 'speech_therapist', label: 'Speech Therapist' },
  { value: 'admin', label: 'Administrator' },
]

const STAFF_ROLES = ['psychologist', 'psychometrician', 'occupational_therapist', 'speech_therapist']
const isStaff = (r) => STAFF_ROLES.includes(r)

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
  role: '',
  phone: '',
  employee_id: '',
  position: '',
  license_no: '',
  title: '',
}

function Employees() {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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
    setNotice(null)
    if (!form.email || !form.password || !form.display_name || !form.role) {
      setError('Email, password, full name, and role are required.')
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
    if (form.role === 'admin' && !form.employee_id) {
      setError('Employee ID is required for administrators.')
      return
    }
    setSubmitting(true)
    try {
      await api.admin.createEmployee({
        email: form.email,
        password: form.password,
        display_name: form.display_name,
        role: form.role,
        phone: form.phone,
        employee_id: form.employee_id,
        position: form.position,
        license_no: form.license_no,
        title: form.title,
        avatar,
      })
      const roleLabel = ROLES.find((r) => r.value === form.role)?.label || form.role
      setNotice(`Registered ${form.display_name} as ${roleLabel}. They can sign in with their email and password.`)
      setForm(empty)
      setAvatar(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <StaffHeader title="Employee Registration" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Register a New Employee</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Create a clinician, therapist, or administrator account. They&apos;ll receive a login for
          their portal based on the role you assign.
        </div>

        <form onSubmit={submit} className="mt-5 max-w-3xl space-y-5">
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
            <Input
              label="Email address"
              type="email"
              tone="purple"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <Input
              label="Phone (optional)"
              tone="purple"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
            <Input
              label="Temporary Password"
              type="password"
              tone="purple"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              tone="purple"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
            />
          </Section>

          <Section title="Profile" hint="Identity and role within the clinic">
            <Input
              label="Full Name"
              tone="purple"
              value={form.display_name}
              onChange={(e) => set('display_name', e.target.value)}
            />
            <Select label="Role" value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Section>

          {form.role === 'admin' ? (
            <Section title="Administrator Details" hint="Stored on the admin profile">
              <Input
                label="Employee ID"
                tone="purple"
                value={form.employee_id}
                onChange={(e) => set('employee_id', e.target.value)}
              />
              <Input
                label="Position"
                tone="purple"
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
              />
            </Section>
          ) : null}

          {isStaff(form.role) ? (
            <Section title="Professional Credentials" hint="Stored on the staff record">
              <Input
                label="PRC License No."
                tone="purple"
                value={form.license_no}
                onChange={(e) => set('license_no', e.target.value)}
              />
              <Input
                label="Title (e.g. Clinical Psychologist)"
                tone="purple"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Section>
          ) : null}

          {error ? (
            <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          {notice ? (
            <div className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register Employee'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setForm(empty)
                setError(null)
                setNotice(null)
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Employees
