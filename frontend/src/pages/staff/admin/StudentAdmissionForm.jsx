import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import PhotoCapture from '../../../components/ui/PhotoCapture'
import SignatureField from '../../../components/ui/SignatureField'
import Button from '../../../components/ui/Button'
import { blankInput } from '../../../components/ui/formStyles'
import { api } from '../../../lib/api'

const ENROLLMENT = [
  { value: 'HSN', label: 'Higher Support Needs Program (HSN) - 48 hours per month' },
  { value: 'MSN', label: 'Moderate Support Needs Program (MSN) - 36 hours per month' },
  { value: 'LSN', label: 'Low Support Needs Program (LSN) - 24 hours per month' },
  { value: 'Individual', label: 'Individual Session' },
]

const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i += 1) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function YesNo() {
  return (
    <span className="inline-flex items-center gap-5">
      <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-800">
        <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Yes
      </label>
      <label className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-800">
        <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> No
      </label>
    </span>
  )
}

function StudentAdmissionForm({ onSaved, onClose }) {
  const [f, setF] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthdate: '',
    sex: '',
    nickName: '',
    presentAddress: '',
    placeOfBirth: '',
    citizenship: '',
    religion: '',
    motherName: '',
    motherOccupation: '',
    motherMobile: '',
    motherEmail: '',
    fatherName: '',
    fatherOccupation: '',
    fatherMobile: '',
    fatherEmail: '',
    emergencyName: '',
    emergencyContact: '',
    emergencyRelation: '',
    diagnosis: '',
    disability: '',
    allergies: '',
    iepLevel: '',
  })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [created, setCreated] = useState(null)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const register = async () => {
    setError(null)
    const email = f.motherEmail.trim() || f.fatherEmail.trim()
    if (!f.firstName.trim() || !f.lastName.trim() || !f.birthdate || !f.sex) {
      setError('Student first name, last name, birthdate, and sex are required.')
      return
    }
    if (!email) {
      setError('A parent email is required to create the student’s login.')
      return
    }
    setSaving(true)
    const password = genPassword()
    try {
      await api.admin.createPatient({
        parent_email: email,
        parent_password: password,
        child: {
          first_name: f.firstName,
          middle_name: f.middleName,
          last_name: f.lastName,
          nick_name: f.nickName,
          date_of_birth: f.birthdate,
          sex: f.sex,
          home_address: f.presentAddress,
          place_of_birth: f.placeOfBirth,
          citizenship: f.citizenship,
          religion: f.religion,
          photo,
        },
        clinical: {
          iep_level: f.iepLevel || null,
          primary_diagnosis: f.diagnosis || null,
          secondary_diagnosis: f.disability || null,
          allergies: f.allergies || null,
        },
        guardians: [
          {
            full_name: f.motherName,
            relationship: 'Mother',
            occupation: f.motherOccupation,
            contact_number: f.motherMobile,
            email: f.motherEmail,
          },
          {
            full_name: f.fatherName,
            relationship: 'Father',
            occupation: f.fatherOccupation,
            contact_number: f.fatherMobile,
            email: f.fatherEmail,
          },
        ],
        emergency: {
          full_name: f.emergencyName,
          relationship: f.emergencyRelation,
          contact_number: f.emergencyContact,
        },
      })
      setCreated({ name: `${f.firstName} ${f.lastName}`, email, password })
      onSaved?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const actions = created ? (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[12.5px]">
      <div className="font-semibold text-emerald-800">Student registered — {created.name}</div>
      <div className="mt-1 text-slate-700">
        Parent login email: <span className="font-mono">{created.email}</span>
      </div>
      <div className="text-slate-700">
        Temporary password: <span className="font-mono">{created.password}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Share these with the parent so they can sign in.</p>
      <Button className="mt-3" onClick={onClose}>
        Done
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</div> : null}
      <button
        onClick={register}
        disabled={saving}
        className="rounded-md bg-purple-700 px-6 py-3 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
      >
        {saving ? 'Registering…' : 'Register Student'}
      </button>
    </div>
  )

  return (
    <FormShell
      title="STUDENT ADMISSION FORM"
      code="CMPS:SE-FO-01 rev.0 02192026"
      confidential={false}
      actions={actions}
      onClose={onClose}
      multiPage={true}
    >
      <div>
        <FormHeading numeral="">Personal Information</FormHeading>
        <div className="flex gap-6">
          <div className="flex-1 space-y-0.5">
            <BlankField label="Last Name">
              <input className={blankInput} value={f.lastName} onChange={set('lastName')} />
            </BlankField>
            <BlankField label="First Name">
              <input className={blankInput} value={f.firstName} onChange={set('firstName')} />
            </BlankField>
            <BlankField label="Middle Name">
              <input className={blankInput} value={f.middleName} onChange={set('middleName')} />
            </BlankField>
            <BlankField label="Birthdate (Month/Day/Date)">
              <input type="date" className={blankInput} value={f.birthdate} onChange={set('birthdate')} />
            </BlankField>
            <BlankField label="Place of Birth">
              <input className={blankInput} value={f.placeOfBirth} onChange={set('placeOfBirth')} />
            </BlankField>
            <BlankField label="Age/Sex">
              <div className="flex gap-2">
                <input className={blankInput} placeholder="Age" />
                <select className={blankInput} value={f.sex} onChange={set('sex')}>
                  <option value="">Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </BlankField>
            <div className="h-1" />
            <BlankField label="Nickname">
              <input className={blankInput} value={f.nickName} onChange={set('nickName')} />
            </BlankField>
            <BlankField label="Present Address">
              <input className={blankInput} value={f.presentAddress} onChange={set('presentAddress')} />
            </BlankField>
          </div>
          <div className="shrink-0 print:hidden">
            <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              2X2 ID Picture
            </div>
            <PhotoCapture value={photo} onChange={setPhoto} square />
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-4">
          <span className="text-[12.5px] text-slate-800">Is your Present Address also your Permanent Address?</span>
          <YesNo />
        </div>
        <div className="mt-1 space-y-0.5">
          <BlankField
            label="Permanent Address"
            hint="(if not same as Present Address. Otherwise, put “Same”)"
          />
          <BlankField label="Citizenship">
            <input className={blankInput} value={f.citizenship} onChange={set('citizenship')} />
          </BlankField>
          <BlankField label="Religion">
            <input className={blankInput} value={f.religion} onChange={set('religion')} />
          </BlankField>
        </div>

        <FormHeading numeral="">Parent Information</FormHeading>
        <div className="space-y-0.5">
          <BlankField label="Name of Mother/Guardian">
            <input className={blankInput} value={f.motherName} onChange={set('motherName')} />
          </BlankField>
          <BlankField label="Occupation">
            <input className={blankInput} value={f.motherOccupation} onChange={set('motherOccupation')} />
          </BlankField>
          <BlankField label="Mobile Number">
            <input className={blankInput} value={f.motherMobile} onChange={set('motherMobile')} />
          </BlankField>
          <BlankField label="Email Address">
            <input type="email" className={blankInput} value={f.motherEmail} onChange={set('motherEmail')} />
          </BlankField>
          <BlankField label="Name of Father/Guardian">
            <input className={blankInput} value={f.fatherName} onChange={set('fatherName')} />
          </BlankField>
          <BlankField label="Occupation">
            <input className={blankInput} value={f.fatherOccupation} onChange={set('fatherOccupation')} />
          </BlankField>
          <BlankField label="Mobile Number">
            <input className={blankInput} value={f.fatherMobile} onChange={set('fatherMobile')} />
          </BlankField>
          <BlankField label="Email Address">
            <input type="email" className={blankInput} value={f.fatherEmail} onChange={set('fatherEmail')} />
          </BlankField>
        </div>
      </div>

      <div>
        <FormHeading numeral="">Emergency Contact Information</FormHeading>
        <div className="space-y-0.5">
          <BlankField label="Name of Emergency Contact Person" labelClassName="w-64">
            <input className={blankInput} value={f.emergencyName} onChange={set('emergencyName')} />
          </BlankField>
          <BlankField label="Contact Number" labelClassName="w-64">
            <input className={blankInput} value={f.emergencyContact} onChange={set('emergencyContact')} />
          </BlankField>
          <BlankField label="Relation to the Client" labelClassName="w-64">
            <input className={blankInput} value={f.emergencyRelation} onChange={set('emergencyRelation')} />
          </BlankField>
        </div>

        <FormHeading numeral="">Diagnosis</FormHeading>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12.5px] text-slate-800">Was the student previously diagnosed/assessed?</span>
          <YesNo />
        </div>
        <div className="mt-1">
          <BlankField label="Diagnosis">
            <input className={blankInput} value={f.diagnosis} onChange={set('diagnosis')} />
          </BlankField>
        </div>

        <FormHeading numeral="">Disability/Impairment</FormHeading>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12.5px] text-slate-800">
            Does the student has other disability/impairment that will hinder the program?
          </span>
          <YesNo />
        </div>
        <div className="mt-1">
          <BlankField label="Diagnosis">
            <input className={blankInput} value={f.disability} onChange={set('disability')} />
          </BlankField>
        </div>

        <FormHeading numeral="">Allergies</FormHeading>
        <BlankField label="">
          <input className={blankInput} value={f.allergies} onChange={set('allergies')} />
        </BlankField>

        <FormHeading numeral="">Enrollment Type</FormHeading>
        <div className="space-y-0.5 text-[12.5px] text-slate-800">
          {ENROLLMENT.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="enrollment"
                className="h-3.5 w-3.5 shrink-0 accent-purple-700"
                checked={f.iepLevel === opt.value}
                onChange={() => setF((s) => ({ ...s, iepLevel: opt.value }))}
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <SignatureField label="Signature over Printed Name of Parent / Date" />
          <SignatureField label="Signature over Printed Name of CMPS Representative / Date" />
        </div>
      </div>
    </FormShell>
  )
}

export default StudentAdmissionForm
