import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ProfileSetupLayout from './ProfileSetupLayout'

const SectionDivider = ({ label }) => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-px flex-1 bg-purple-200" />
    <span className="text-xs font-semibold tracking-wider text-purple-700">
      {label}
    </span>
    <div className="h-px flex-1 bg-purple-200" />
  </div>
)

function ProfileSetupClinical() {
  const navigate = useNavigate()
  return (
    <ProfileSetupLayout current={3}>
      <h1 className="text-3xl font-bold text-purple-800">Clinical Information</h1>
      <p className="mt-1 text-sm text-slate-600">
        The information is kept confidential and used only for intervention planning.
      </p>

      <SectionDivider label="DIAGNOSIS" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Primary Diagnosis (ICD-10)" placeholder="Select Diagnosis">
          <option>Autism Spectrum Disorder</option>
          <option>ADHD</option>
          <option>Other</option>
        </Select>
        <Input label="IEP Level" tone="purple" />
        <Input label="Secondary Diagnosis (optional)" tone="purple" />
        <Input label="Email Address" type="email" tone="purple" />
      </div>

      <SectionDivider label="CLINICAL ASSIGNMENT" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Treating Psychologist" tone="purple" />
        <Input label="Treating Psychometrician" tone="purple" />
        <Input label="Date of Enrollment" type="date" tone="purple" />
        <Input label="Referral Source" tone="purple" />
      </div>

      <Button
        className="mt-8"
        fullWidth
        size="lg"
        onClick={() => navigate('/client')}
      >
        Complete Profile
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupClinical
