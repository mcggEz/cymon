import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import ProfileSetupLayout from './ProfileSetupLayout'
import { mergeSetupDraft, getSetupDraft } from './setupDraft'

const SectionDivider = ({ label }) => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-px flex-1 bg-purple-200" />
    <span className="text-xs font-semibold tracking-wider text-purple-700">
      {label}
    </span>
    <div className="h-px flex-1 bg-purple-200" />
  </div>
)

function ProfileSetupGuardian() {
  const navigate = useNavigate()
  const draft = getSetupDraft()
  const [guardian, setGuardian] = useState(() => ({
    full_name: '',
    relationship: '',
    contact_number: '',
    email: '',
    occupation: '',
    employer: '',
    ...(draft.guardian || {}),
  }))
  const [emergency, setEmergency] = useState(() => ({
    full_name: '',
    relationship: '',
    contact_number: '',
    alt_contact_number: '',
    address: '',
    ...(draft.emergency || {}),
  }))
  const setG = (k) => (e) => setGuardian((g) => ({ ...g, [k]: e.target.value }))
  const setE = (k) => (e) => setEmergency((x) => ({ ...x, [k]: e.target.value }))

  const handleNext = () => {
    mergeSetupDraft({ guardian, emergency })
    navigate('/setup/clinical')
  }

  return (
    <ProfileSetupLayout current={2}>
      <h1 className="text-3xl font-bold text-purple-800">
        Guardian & Emergency Contact
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Provide the primary guardian and emergency contact details
      </p>

      <SectionDivider label="PRIMARY GUARDIAN" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Guardian Full Name" tone="purple" value={guardian.full_name} onChange={setG('full_name')} />
        <Input label="Relationship to Child" tone="purple" value={guardian.relationship} onChange={setG('relationship')} />
        <Input label="Guardian Contact No." tone="purple" value={guardian.contact_number} onChange={setG('contact_number')} />
        <Input label="Email Address" type="email" tone="purple" value={guardian.email} onChange={setG('email')} />
        <Input label="Occupation" tone="purple" value={guardian.occupation} onChange={setG('occupation')} />
        <Input label="Employer / Company" tone="purple" value={guardian.employer} onChange={setG('employer')} />
      </div>

      <SectionDivider label="CONTACT & LOCATION" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Emergency Contact Name" tone="purple" value={emergency.full_name} onChange={setE('full_name')} />
        <Input label="Relationship" tone="purple" value={emergency.relationship} onChange={setE('relationship')} />
        <Input label="Emergency Contact No." tone="purple" value={emergency.contact_number} onChange={setE('contact_number')} />
        <Input label="Alternative Contact No." tone="purple" value={emergency.alt_contact_number} onChange={setE('alt_contact_number')} />
        <Input label="Address" tone="purple" className="sm:col-span-2" value={emergency.address} onChange={setE('address')} />
      </div>

      <Button className="mt-8" fullWidth size="lg" onClick={handleNext}>
        Next: Clinical Info →
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupGuardian
