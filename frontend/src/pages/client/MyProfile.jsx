import PageHeader from './PageHeader'

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
    {children}
  </span>
)

const Field = ({ label, value, tone = 'default' }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </div>
    <div
      className={[
        'text-sm font-medium',
        tone === 'amber' ? 'text-amber-600' : 'text-purple-800',
      ].join(' ')}
    >
      {value}
    </div>
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

const EditBtn = () => (
  <button className="inline-flex items-center gap-1 rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50">
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
    Edit
  </button>
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

function MyProfile() {
  return (
    <>
      <PageHeader title="My Profile" subtitle="Leo Cruz" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
              LC
            </div>
            <div>
              <div className="text-2xl font-bold">Leo Cruz</div>
              <div className="text-xs opacity-80">Patient ID: CMPS-2026-001</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>★ IEP Level 2</Pill>
                <Pill>ClearMind Clinic</Pill>
                <Pill>Dr. Jinky C. Malabanan</Pill>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Personal Information" icon="●" action={<EditBtn />}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value="Leo Cruz" />
              <Field label="Patient ID" value="CMPS-2026-001" />
              <Field label="Date of Birth" value="June 14, 2019" />
              <Field label="Age" value="6 years old" />
              <Field label="Sex" value="Male" />
              <Field label="Blood Type" value="O+" />
              <Field label="Contact" value="(02) 8123-4567" />
              <Field label="Address" value="Quezon City, Metro Manila" />
            </div>
          </Card>

          <Card title="Clinical Information" icon="◆">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Diagnosis" value="Autism Spectrum Disorder" />
              <Field label="IEP Level" value="Level 2 — Moderate" />
              <Field label="Treating Clinician" value="Dr. Jinky C. Malabanan" />
              <Field label="Clinic" value="ClearMind Psych. Services" />
              <Field label="Date Enrolled" value="Jan 8, 2026" />
              <Field label="Last Assessment" value="Feb 28, 2026" />
              <Field label="GARS-3 (GAI)" value="112 — Moderate" tone="amber" />
              <Field label="Next Review" value="Mar 15, 2026" />
            </div>
          </Card>

          <Card title="Guardian & Emergency Contact" icon="■">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Guardian Name" value="Maria Cruz" />
              <Field label="Relationship" value="Mother" />
              <Field label="Contact" value="+63 917 123 4567" />
              <Field label="Email" value="maria@email.com" />
            </div>
          </Card>

          <Card title="Account Settings" icon="✦">
            <SettingsRow
              title="Change Password"
              subtitle="Last changed 30 days ago"
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
              subtitle="English (Philippines)"
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
