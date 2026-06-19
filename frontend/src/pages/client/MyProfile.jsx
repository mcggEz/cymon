import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../lib/api'
import Skeleton from '../../components/ui/Skeleton'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
    {children}
  </span>
)

const Field = ({ label, value, tone = 'default', loading = false }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    {loading ? (
      <Skeleton className="mt-1 h-4 w-24" />
    ) : (
      <div
        className={[
          'text-sm font-medium transition-opacity duration-300',
          tone === 'amber' ? 'text-amber-600' : 'text-purple-800',
        ].join(' ')}
      >
        {value ?? '—'}
      </div>
    )}
  </div>
)

const Card = ({ title, icon, action, children }) => (
  <section className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-purple-700">
          {icon}
        </div>
        <div className="text-sm font-semibold text-purple-800">{title}</div>
      </div>
      {action}
    </div>
    <div className="pt-4">{children}</div>
  </section>
)

const SettingsRow = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
    <div>
      <div className="text-sm font-medium text-slate-800">{title}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
    {action}
  </div>
)

const longDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null
const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null

const initialsOf = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

function MyProfile() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const load = () =>
    api.client
      .getPatient()
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  if (error) {
    return (
      <>
        <PageHeader title="My Profile" />
        <div className="flex-1 p-6">
          <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
        </div>
      </>
    )
  }

  const { patient, clinical, guardian, clinic } = data || {}
  const sexLabel = patient?.sex ? patient.sex[0].toUpperCase() + patient.sex.slice(1) : null
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const startEdit = () => {
    setSaveError(null)
    setForm({
      first_name: patient?.first_name || '',
      middle_name: patient?.middle_name || '',
      last_name: patient?.last_name || '',
      date_of_birth: patient?.date_of_birth || '',
      sex: patient?.sex || '',
      blood_type: patient?.blood_type || '',
      contact_number: patient?.contact_number || '',
      home_address: patient?.home_address || '',
      g_full_name: guardian?.full_name || '',
      g_relationship: guardian?.relationship || '',
      g_contact_number: guardian?.contact_number || '',
      g_email: guardian?.email || '',
    })
    setEditing(true)
  }

  const save = async () => {
    setSaveError(null)
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setSaveError('First and last name are required.')
      return
    }
    setSaving(true)
    try {
      await api.client.updatePatient({
        patient: {
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth,
          sex: form.sex,
          blood_type: form.blood_type,
          contact_number: form.contact_number,
          home_address: form.home_address,
        },
        guardian: {
          full_name: form.g_full_name,
          relationship: form.g_relationship,
          contact_number: form.g_contact_number,
          email: form.g_email,
        },
      })
      await load()
      setEditing(false)
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const personalAction = editing ? (
    <div className="flex gap-2">
      <button
        onClick={() => setEditing(false)}
        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        onClick={save}
        disabled={saving}
        className="rounded-md bg-purple-700 px-3 py-1 text-xs font-medium text-white hover:bg-purple-800 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  ) : patient ? (
    <button
      onClick={startEdit}
      className="inline-flex items-center gap-1 rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50"
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
        <path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Edit
    </button>
  ) : null

  return (
    <>
      <PageHeader title="My Profile" subtitle={patient?.full_name} />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
              {loading ? '' : initialsOf(patient?.full_name)}
            </div>
            {loading ? (
              <div>
                <div className="h-7 w-44 rounded-md bg-white/25 animate-pulse" />
                <div className="mt-2 h-3 w-28 rounded bg-white/20 animate-pulse" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">{patient?.full_name}</div>
                <div className="text-xs opacity-80">Patient ID: {patient?.patient_id}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {clinical?.iep_level ? <Pill>★ {clinical.iep_level}</Pill> : null}
                  {clinic?.name ? <Pill>{clinic.name}</Pill> : null}
                  {clinical?.treating_psychologist_name ? (
                    <Pill>{clinical.treating_psychologist_name}</Pill>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>

        {saveError ? (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Personal Information" icon="●" action={personalAction}>
            {editing ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="First Name" value={form.first_name} onChange={(e) => setF('first_name', e.target.value)} />
                <Input label="Middle Name" value={form.middle_name} onChange={(e) => setF('middle_name', e.target.value)} />
                <Input label="Last Name" value={form.last_name} onChange={(e) => setF('last_name', e.target.value)} />
                <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => setF('date_of_birth', e.target.value)} />
                <Select label="Sex" value={form.sex} onChange={(e) => setF('sex', e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
                <Input label="Blood Type" value={form.blood_type} onChange={(e) => setF('blood_type', e.target.value)} />
                <Input label="Contact" value={form.contact_number} onChange={(e) => setF('contact_number', e.target.value)} />
                <Input label="Address" value={form.home_address} onChange={(e) => setF('home_address', e.target.value)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field loading={loading} label="Full Name" value={patient?.full_name} />
                <Field loading={loading} label="Patient ID" value={patient?.patient_id} />
                <Field loading={loading} label="Date of Birth" value={longDate(patient?.date_of_birth)} />
                <Field loading={loading} label="Age" value={patient?.age != null ? `${patient.age} years old` : null} />
                <Field loading={loading} label="Sex" value={sexLabel} />
                <Field loading={loading} label="Blood Type" value={patient?.blood_type} />
                <Field loading={loading} label="Contact" value={patient?.contact_number} />
                <Field loading={loading} label="Address" value={patient?.home_address} />
              </div>
            )}
          </Card>

          <Card title="Clinical Information" icon="◆">
            <div className="grid grid-cols-2 gap-4">
              <Field loading={loading} label="Primary Diagnosis" value={clinical?.primary_diagnosis} />
              <Field loading={loading} label="IEP Level" value={clinical?.iep_level} />
              <Field loading={loading} label="Treating Clinician" value={clinical?.treating_psychologist_name} />
              <Field loading={loading} label="Clinic" value={clinic?.name} />
              <Field loading={loading} label="Date Enrolled" value={shortDate(clinical?.date_enrolled)} />
              <Field loading={loading} label="Last Assessment" value={shortDate(clinical?.last_assessment_at)} />
              <Field
                loading={loading}
                label="GARS-3 (GAI)"
                value={
                  clinical?.gars3_gai_score
                    ? `${clinical.gars3_gai_score}${clinical.gars3_label ? ` — ${clinical.gars3_label}` : ''}`
                    : null
                }
                tone="amber"
              />
              <Field loading={loading} label="Next Review" value={shortDate(clinical?.next_review_at)} />
            </div>
          </Card>

          <Card title="Guardian & Emergency Contact" icon="■">
            {editing ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Guardian Name" value={form.g_full_name} onChange={(e) => setF('g_full_name', e.target.value)} />
                <Input label="Relationship" value={form.g_relationship} onChange={(e) => setF('g_relationship', e.target.value)} />
                <Input label="Contact" value={form.g_contact_number} onChange={(e) => setF('g_contact_number', e.target.value)} />
                <Input label="Email" type="email" value={form.g_email} onChange={(e) => setF('g_email', e.target.value)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Field loading={loading} label="Guardian Name" value={guardian?.full_name} />
                <Field loading={loading} label="Relationship" value={guardian?.relationship} />
                <Field loading={loading} label="Contact" value={guardian?.contact_number} />
                <Field loading={loading} label="Email" value={guardian?.email} />
              </div>
            )}
          </Card>

          <Card title="Account Settings" icon="✦">
            <SettingsRow
              title="Change Password"
              subtitle="Keep your account secure"
              action={
                <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                  Change
                </button>
              }
            />
            <SettingsRow
              title="Notification Preferences"
              subtitle="Email & SMS alerts enabled"
              action={
                <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                  Manage
                </button>
              }
            />
            <SettingsRow
              title="Language"
              subtitle={patient?.preferred_language || 'English (Philippines)'}
              action={
                <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                  Change
                </button>
              }
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default MyProfile
