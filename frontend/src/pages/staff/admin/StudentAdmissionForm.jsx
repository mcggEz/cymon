import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea, fieldReadonly } from '../../../components/ui/formStyles'

const ENROLLMENT_TYPES = [
  { value: 'HSN', badge: 'bg-rose-100 text-rose-700', label: 'Higher Support Needs Program — 48 hours per month' },
  { value: 'MSN', badge: 'bg-amber-100 text-amber-700', label: 'Moderate Support Needs Program — 36 hours per month' },
  { value: 'LSN', badge: 'bg-emerald-100 text-emerald-700', label: 'Low Support Needs Program — 24 hours per month' },
  { value: 'IND', badge: 'bg-blue-100 text-blue-700', label: 'Individual Session' },
]

const ynName = (name, value, checked, onChange) => (
  <label
    className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-semibold ${
      checked ? 'border-purple-400 bg-purple-100 text-purple-900' : 'border-purple-200 text-slate-600'
    }`}
  >
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
    {value}
  </label>
)

function ageFromBirthdate(value) {
  const dob = new Date(value)
  if (Number.isNaN(dob.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1
  return age >= 0 ? `${age} years old` : ''
}

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let pw = ''
  for (let i = 0; i < 10; i += 1) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

function StudentAdmissionForm({ onClose }) {
  const [birthdate, setBirthdate] = useState('')
  const [lastName, setLastName] = useState('')
  const [sameAddress, setSameAddress] = useState('')
  const [permanentAddress, setPermanentAddress] = useState('')
  const [prevDiag, setPrevDiag] = useState('')
  const [disability, setDisability] = useState('')
  const [enrollType, setEnrollType] = useState('')
  const [email, setEmail] = useState('')
  const [creds, setCreds] = useState({ studentId: '', username: '', password: '' })
  const [parentSig, setParentSig] = useState(null)
  const [repSig, setRepSig] = useState(null)

  const age = ageFromBirthdate(birthdate)
  const hasEmail = email.trim().length > 0

  const generateCredentials = () => {
    if (hasEmail) return
    const suffix = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const studentId = `CM-${new Date().getFullYear()}-${suffix}`
    const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z]/g, '') || 'student'
    const username = `${cleanLast}${suffix.slice(-3)}`
    setCreds({ studentId, username, password: randomPassword() })
  }

  return (
    <FormShell
      title="Student Admission Form"
      subtitle="Admin dashboard · Special Education Program"
      code="CMPS:SE-FO-01 rev.0 02192026"
      onClose={onClose}
    >
      <FormSection eyebrow="01" title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Last Name">
            <input className={fieldInput} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField label="First Name">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Middle Name">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Birthdate">
            <input type="date" className={fieldInput} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
          </FormField>
          <FormField label="Place of Birth">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Sex">
            <select className={fieldInput} defaultValue="">
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </FormField>
          <FormField label="Age (auto)">
            <input className={fieldReadonly} value={age} readOnly />
          </FormField>
          <FormField label="Nickname">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Citizenship">
            <input className={fieldInput} />
          </FormField>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Present Address">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Religion">
            <input className={fieldInput} />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Is your Present Address also your Permanent Address?">
            <div className="flex max-w-[280px] gap-2">
              {ynName('sameAddress', 'Yes', sameAddress === 'Yes', () => {
                setSameAddress('Yes')
                setPermanentAddress('Same')
              })}
              {ynName('sameAddress', 'No', sameAddress === 'No', () => {
                setSameAddress('No')
                setPermanentAddress((v) => (v === 'Same' ? '' : v))
              })}
            </div>
          </FormField>
        </div>
        <div className="mt-3">
          <FormField label="Permanent Address (if not same as present address)">
            <input
              className={sameAddress === 'Yes' ? fieldReadonly : fieldInput}
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              readOnly={sameAddress === 'Yes'}
              placeholder='Enter address, or type "Same"'
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="02" title="Parent Information">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-bold text-slate-700">Mother / Guardian</div>
            <div className="grid gap-4">
              <FormField label="Name">
                <input className={fieldInput} />
              </FormField>
              <FormField label="Occupation">
                <input className={fieldInput} />
              </FormField>
              <FormField label="Mobile Number">
                <input type="tel" className={fieldInput} />
              </FormField>
              <FormField label="Email Address">
                <input type="email" className={fieldInput} />
              </FormField>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-slate-700">Father / Guardian</div>
            <div className="grid gap-4">
              <FormField label="Name">
                <input className={fieldInput} />
              </FormField>
              <FormField label="Occupation">
                <input className={fieldInput} />
              </FormField>
              <FormField label="Mobile Number">
                <input type="tel" className={fieldInput} />
              </FormField>
              <FormField label="Email Address">
                <input type="email" className={fieldInput} />
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection eyebrow="03" title="Emergency Contact Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Name of Emergency Contact Person">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Contact Number">
            <input type="tel" className={fieldInput} />
          </FormField>
          <FormField label="Relation to the Client">
            <input className={fieldInput} />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="04" title="Diagnosis & Disability">
        <FormField label="Was the student previously diagnosed / assessed?">
          <div className="mb-3 flex max-w-[280px] gap-2">
            {ynName('prevDiag', 'Yes', prevDiag === 'Yes', () => setPrevDiag('Yes'))}
            {ynName('prevDiag', 'No', prevDiag === 'No', () => setPrevDiag('No'))}
          </div>
        </FormField>
        <div className="mb-4">
          <FormField label="Diagnosis">
            <input className={fieldInput} />
          </FormField>
        </div>

        <FormField label="Does the student have other disability/impairment that will hinder the program?">
          <div className="mb-3 flex max-w-[280px] gap-2">
            {ynName('disability', 'Yes', disability === 'Yes', () => setDisability('Yes'))}
            {ynName('disability', 'No', disability === 'No', () => setDisability('No'))}
          </div>
        </FormField>
        <div className="mb-4">
          <FormField label="Diagnosis">
            <input className={fieldInput} />
          </FormField>
        </div>

        <FormField label="Allergies">
          <textarea className={fieldTextarea} />
        </FormField>
      </FormSection>

      <FormSection eyebrow="05" title="Enrollment Type">
        <div className="grid gap-2">
          {ENROLLMENT_TYPES.map((t) => {
            const checked = enrollType === t.value
            return (
              <label
                key={t.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  checked ? 'border-purple-400 bg-purple-100' : 'border-purple-200'
                }`}
              >
                <input
                  type="radio"
                  name="enrollType"
                  value={t.value}
                  checked={checked}
                  onChange={() => setEnrollType(t.value)}
                  className="h-4 w-4 accent-purple-700"
                />
                <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${t.badge}`}>{t.value}</span>
                <span className="text-slate-700">{t.label}</span>
              </label>
            )
          })}
        </div>
      </FormSection>

      <FormSection eyebrow="06" title="Account Registration">
        <div className="rounded-xl bg-purple-100/60 p-4">
          <p className="mb-4 text-[11px] font-semibold text-purple-900">
            This creates the portal login the parent/guardian will use to view their child's IEP, assessments, and
            session records.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Login Email (optional)"
              hint="Leave blank if the family has no email. Credentials are generated locally instead."
            >
              <input
                type="email"
                className={fieldInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
              />
            </FormField>
            <FormField label="Account Status">
              <select className={fieldInput} defaultValue="Pending verification">
                <option>Pending verification</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </FormField>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={generateCredentials}
              disabled={hasEmail}
              className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate login credentials
            </button>
            {hasEmail ? (
              <p className="mt-2 text-[11px] italic text-purple-800">
                An email is on file — login credentials will be sent to {email.trim()} instead of being generated here.
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-slate-500">
                No email on file. Generate a Student ID, username, and temporary password to hand to the
                parent/guardian in person.
              </p>
            )}
          </div>

          {!hasEmail && creds.studentId ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <FormField label="Student ID" hint="Primary login ID — works even without an email address.">
                <input className={fieldReadonly} value={creds.studentId} readOnly />
              </FormField>
              <FormField label="Username" hint="Friendly alias derived from the student's name.">
                <input className={fieldReadonly} value={creds.username} readOnly />
              </FormField>
              <FormField label="Temporary Password" hint="Parent must change this on first login.">
                <input className={fieldReadonly} value={creds.password} readOnly />
              </FormField>
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection eyebrow="Sign-off" title="Signatures">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <SignaturePad
              label="Signature over Printed Name of Parent"
              value={parentSig}
              onChange={setParentSig}
            />
            <FormField label="Date" className="mt-3">
              <input type="date" className={fieldInput} />
            </FormField>
          </div>
          <div>
            <SignaturePad
              label="Signature over Printed Name of CMPS Representative"
              value={repSig}
              onChange={setRepSig}
            />
            <FormField label="Date" className="mt-3">
              <input type="date" className={fieldInput} />
            </FormField>
          </div>
        </div>
      </FormSection>
    </FormShell>
  )
}

export default StudentAdmissionForm
