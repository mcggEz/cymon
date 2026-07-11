import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../lib/api'
import Skeleton from '../../components/ui/Skeleton'
import Input from '../../components/ui/Input'

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

const Card = ({ title, action, children }) => (
  <section className="rounded-2xl bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="text-sm font-semibold text-purple-800">{title}</div>
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
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)

  useEffect(() => {
    api.client
      .getPatient()
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
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

  const { patient, clinical, guardian, emergency, clinic } = data || {}
  const sexLabel = patient?.sex ? patient.sex[0].toUpperCase() + patient.sex.slice(1) : null

  const changePassword = async () => {
    setPwMsg(null)
    if (pw.next.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPwSaving(true)
    try {
      await api.changePassword({ currentPassword: pw.current, newPassword: pw.next })
      setPw({ current: '', next: '', confirm: '' })
      setPwOpen(false)
      setPwMsg({ type: 'success', text: 'Password updated.' })
    } catch (e) {
      setPwMsg({ type: 'error', text: e.message })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="My Profile" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-xl font-bold">
              {loading ? (
                ''
              ) : patient?.photo_url ? (
                <img src={patient.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initialsOf(patient?.full_name)
              )}
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
                  {clinical?.iep_level ? <Pill>{clinical.iep_level}</Pill> : null}
                  {clinic?.name ? <Pill>{clinic.name}</Pill> : null}
                  {clinical?.treating_psychologist_name ? (
                    <Pill>{clinical.treating_psychologist_name}</Pill>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-4 rounded-md bg-purple-50 px-4 py-2 text-xs text-purple-700">
          To update your details, please contact the ClearMind admin office.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Personal Information">
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
          </Card>

          <Card title="Clinical Information">
            <div className="grid grid-cols-2 gap-4">
              <Field loading={loading} label="Chief Complaint" value={clinical?.chief_complaint} />
              <Field loading={loading} label="Working Diagnosis" value={clinical?.working_diagnosis} />
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

          <Card title="Guardian & Emergency Contact">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field loading={loading} label="Guardian Name" value={guardian?.full_name} />
                <Field loading={loading} label="Relationship" value={guardian?.relationship} />
                <Field loading={loading} label="Contact" value={guardian?.contact_number} />
                <Field loading={loading} label="Email" value={guardian?.email} />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <Field loading={loading} label="Emergency Name" value={emergency?.full_name} />
                <Field loading={loading} label="Emergency Relationship" value={emergency?.relationship} />
                <Field loading={loading} label="Emergency Contact" value={emergency?.contact_number} />
              </div>
            </div>
          </Card>

          <Card title="Account Settings">
            <SettingsRow
              title="Change Password"
              subtitle="Keep your account secure"
              action={
                <button
                  onClick={() => {
                    setPwMsg(null)
                    setPwOpen((o) => !o)
                  }}
                  className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
                >
                  {pwOpen ? 'Close' : 'Change'}
                </button>
              }
            />
            {pwOpen ? (
              <div className="space-y-3 border-b border-slate-100 py-3">
                <Input label="Current Password" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />
                <Input label="New Password" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
                <Input label="Confirm New Password" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
                <div className="flex justify-end">
                  <button
                    onClick={changePassword}
                    disabled={pwSaving}
                    className="rounded-md bg-purple-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-800 disabled:opacity-60"
                  >
                    {pwSaving ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </div>
            ) : null}
            {pwMsg ? (
              <div
                className={[
                  'mt-1 text-xs font-medium',
                  pwMsg.type === 'error' ? 'text-red-600' : 'text-emerald-600',
                ].join(' ')}
              >
                {pwMsg.text}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  )
}

export default MyProfile
