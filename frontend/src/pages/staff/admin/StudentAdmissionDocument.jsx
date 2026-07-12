import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '')
const ENROLLMENT = [
  { value: 'HSN', label: 'Higher Support Needs Program (HSN) - 48 hours per month' },
  { value: 'MSN', label: 'Moderate Support Needs Program (MSN) - 36 hours per month' },
  { value: 'LSN', label: 'Low Support Needs Program (LSN) - 24 hours per month' },
  { value: 'Individual', label: 'Individual Session' },
]

const Line = ({ label, value, labelClassName = 'w-52' }) => (
  <div className="flex items-baseline gap-2 py-0.5">
    <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${labelClassName}`}>{label}</span>
    <span className="min-w-0 flex-1 border-b border-slate-300 px-1.5 text-[12px] font-medium text-purple-950">
      {value || ' '}
    </span>
  </div>
)

// Read-only, printable render of the Student Admission Form (FO-01) filled with a
// patient's saved record — the "view as PDF form" alternative to the card panel.
function StudentAdmissionDocument({ detail, onClose }) {
  const p = detail?.patient || {}
  const cl = detail?.clinical || {}
  const guardians = detail?.guardians || []
  const mother = guardians.find((g) => g.relationship === 'Mother') || guardians[0] || {}
  const father = guardians.find((g) => g.relationship === 'Father') || guardians[1] || {}
  const em = detail?.emergency || {}

  return (
    <FormShell
      title="STUDENT ADMISSION FORM"
      code="CMPS:SE-FO-01 rev.0 02192026"
      confidential={false}
      onClose={onClose}
      multiPage={true}
    >
      <div>
        <FormHeading numeral="">Personal Information</FormHeading>
        <div className="flex gap-6">
          <div className="flex-1 space-y-0.5">
            <Line label="Last Name" value={p.last_name} />
            <Line label="First Name" value={p.first_name} />
            <Line label="Middle Name" value={p.middle_name} />
            <Line label="Birthdate (Month/Day/Date)" value={p.date_of_birth} />
            <Line label="Place of Birth" value={p.place_of_birth} />
            <Line label="Age/Sex" value={[p.age, cap(p.sex)].filter((x) => x || x === 0).join(' / ')} />
            <div className="h-1" />
            <Line label="Nickname" value={p.nick_name} />
            <Line label="Present Address" value={p.home_address} />
          </div>
          <div className="shrink-0">
            <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              2X2 ID Picture
            </div>
            <div className="flex h-36 w-32 items-center justify-center overflow-hidden border border-slate-900 text-center text-sm text-slate-400">
              {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : '2X2'}
            </div>
          </div>
        </div>

        <div className="mt-1 space-y-0.5">
          <Line label="Citizenship" value={p.citizenship} />
          <Line label="Religion" value={p.religion} />
        </div>

        <FormHeading numeral="">Parent Information</FormHeading>
        <div className="space-y-0.5">
          <Line label="Name of Mother/Guardian" value={mother.full_name} />
          <Line label="Occupation" value={mother.occupation} />
          <Line label="Mobile Number" value={mother.contact_number} />
          <Line label="Email Address" value={mother.email} />
          <Line label="Name of Father/Guardian" value={father.full_name} />
          <Line label="Occupation" value={father.occupation} />
          <Line label="Mobile Number" value={father.contact_number} />
          <Line label="Email Address" value={father.email} />
        </div>
      </div>

      <div>
        <FormHeading numeral="">Emergency Contact Information</FormHeading>
        <div className="space-y-0.5">
          <Line label="Name of Emergency Contact Person" value={em.full_name} labelClassName="w-64" />
          <Line label="Contact Number" value={em.contact_number} labelClassName="w-64" />
          <Line label="Relation to the Client" value={em.relationship} labelClassName="w-64" />
        </div>

        <FormHeading numeral="">Diagnosis</FormHeading>
        <Line label="Diagnosis" value={cl.primary_diagnosis} />

        <FormHeading numeral="">Disability/Impairment</FormHeading>
        <Line label="Diagnosis" value={cl.secondary_diagnosis} />

        <FormHeading numeral="">Allergies</FormHeading>
        <Line label="" value={cl.allergies} />

        <FormHeading numeral="">Enrollment Type</FormHeading>
        <div className="space-y-0.5 text-[12.5px] text-slate-800">
          {ENROLLMENT.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input type="checkbox" readOnly checked={cl.iep_level === opt.value} className="h-3.5 w-3.5 shrink-0 accent-purple-700" />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div>
            <div className="mt-4 border-t border-slate-700" />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Signature over Printed Name of Parent / Date
            </div>
          </div>
          <div>
            <div className="mt-4 border-t border-slate-700" />
            <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">
              Signature over Printed Name of CMPS Representative / Date
            </div>
          </div>
        </div>
      </div>
    </FormShell>
  )
}

export default StudentAdmissionDocument
