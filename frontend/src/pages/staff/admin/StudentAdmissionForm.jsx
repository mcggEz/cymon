import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'

function YesNo() {
  return (
    <span className="inline-flex items-center gap-5">
      <label className="inline-flex items-center gap-1.5 text-sm text-slate-800">
        <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> Yes
      </label>
      <label className="inline-flex items-center gap-1.5 text-sm text-slate-800">
        <input type="checkbox" className="h-3.5 w-3.5 accent-purple-700" /> No
      </label>
    </span>
  )
}

function SignatureLine({ label }) {
  return (
    <div>
      <div className="mt-8 border-t border-slate-700" />
      <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-700">{label}</div>
    </div>
  )
}

function StudentAdmissionForm({ onClose }) {
  return (
    <FormShell title="STUDENT ADMISSION FORM" code="CMPS:SE-FO-01 rev.0 02192026" confidential={false} onClose={onClose}>
      <FormHeading numeral="">Personal Information</FormHeading>
      <div className="flex gap-6">
        <div className="flex-1 space-y-1.5">
          <BlankField label="Last Name" />
          <BlankField label="First Name" />
          <BlankField label="Middle Name" />
          <BlankField label="Birthdate (Month/Day/Date)" />
          <BlankField label="Place of Birth" />
          <BlankField label="Age/Sex" />
          <div className="h-4" />
          <BlankField label="Nickname" />
          <BlankField label="Present Address" />
        </div>
        <div className="shrink-0">
          <div className="flex h-44 w-36 items-center justify-center border border-slate-900 text-center text-sm text-slate-500">
            2X2 ID Picture
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-800">Is your Present Address also your Permanent Address?</span>
        <YesNo />
      </div>
      <div className="mt-1.5 space-y-1.5">
        <BlankField
          label="Permanent Address"
          hint="(if not same as Present Address. Otherwise, put “Same”)"
        />
        <BlankField label="Citizenship" />
        <BlankField label="Religion" />
      </div>

      <FormHeading numeral="">Parent Information</FormHeading>
      <div className="space-y-1.5">
        <BlankField label="Name of Mother/Guardian" />
        <BlankField label="Occupation" />
        <BlankField label="Mobile Number" />
        <BlankField label="Email Address" />
        <BlankField label="Name of Father/Guardian" />
        <BlankField label="Occupation" />
        <BlankField label="Mobile Number" />
        <BlankField label="Email Address" />
      </div>

      <FormHeading numeral="">Emergency Contact Information</FormHeading>
      <div className="space-y-1.5">
        <BlankField label="Name of Emergency Contact Person" labelClassName="w-64" />
        <BlankField label="Contact Number" labelClassName="w-64" />
        <BlankField label="Relation to the Client" labelClassName="w-64" />
      </div>

      <FormHeading numeral="">Diagnosis</FormHeading>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-800">Was the student previously diagnosed/assessed?</span>
        <YesNo />
      </div>
      <div className="mt-1.5">
        <BlankField label="Diagnosis" />
      </div>

      <FormHeading numeral="">Disability/Impairment</FormHeading>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-800">
          Does the student has other disability/impairment that will hinder the program?
        </span>
        <YesNo />
      </div>
      <div className="mt-1.5">
        <BlankField label="Diagnosis" />
      </div>

      <FormHeading numeral="">Allergies</FormHeading>
      <BlankField label="" />

      <FormHeading numeral="">Enrollment Type</FormHeading>
      <div className="space-y-1 text-sm text-slate-800">
        {[
          'Higher Support Needs Program (HSN) - 48 hours per month',
          'Moderate Support Needs Program (MSN) - 36 hours per month',
          'Low Support Needs Program (LSN) - 24 hours per month',
          'Individual Session',
        ].map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input type="checkbox" className="h-3.5 w-3.5 shrink-0 accent-purple-700" />
            {opt}
          </label>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8">
        <SignatureLine label="Signature over Printed Name of Parent / Date" />
        <SignatureLine label="Signature over Printed Name of CMPS Representative / Date" />
      </div>
    </FormShell>
  )
}

export default StudentAdmissionForm
