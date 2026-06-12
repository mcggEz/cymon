import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
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

function ProfileSetupGuardian() {
  const navigate = useNavigate()
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
        <Input label="Guardian Full Name" tone="purple" />
        <Input label="Relationship to Child" tone="purple" />
        <Input label="Guardian Contact No." tone="purple" />
        <Input label="Email Address" type="email" tone="purple" />
        <Input label="Occupation" tone="purple" />
        <Input label="Employer / Company" tone="purple" />
      </div>

      <SectionDivider label="CONTACT & LOCATION" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Emergency Contact Name" tone="purple" />
        <Input label="Relationship" tone="purple" />
        <Input label="Emergency Contact No." tone="purple" />
        <Input label="Alternative Contact No." tone="purple" />
        <Input label="Address" tone="purple" className="sm:col-span-2" />
      </div>

      <Button
        className="mt-8"
        fullWidth
        size="lg"
        onClick={() => navigate('/setup/clinical')}
      >
        Next: Clinical Info →
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupGuardian
