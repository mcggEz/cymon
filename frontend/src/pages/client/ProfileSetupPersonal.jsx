import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ProfileSetupLayout from './ProfileSetupLayout'

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
    <path
      d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const SectionDivider = ({ label }) => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-px flex-1 bg-purple-200" />
    <span className="text-xs font-semibold tracking-wider text-purple-700">
      {label}
    </span>
    <div className="h-px flex-1 bg-purple-200" />
  </div>
)

function ProfileSetupPersonal() {
  const navigate = useNavigate()
  return (
    <ProfileSetupLayout current={1}>
      <h1 className="text-3xl font-bold text-purple-800">Personal Information</h1>
      <p className="mt-1 text-sm text-slate-600">
        Tell us about the child being enrolled
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-700">
          <CameraIcon />
        </div>
        <div>
          <div className="text-sm font-medium text-purple-800">Upload profile photo</div>
          <div className="text-xs text-slate-500">JPG, PNG up to 5 MB · optional</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="First Name" tone="purple" />
        <Input label="Middle Name" tone="purple" />
        <Input label="Last Name" tone="purple" />
        <Input label="Nick Name" tone="purple" />
        <Input label="Date of Birth" type="date" tone="purple" />
        <Select label="Sex" placeholder="Select">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </div>

      <SectionDivider label="CONTACT & LOCATION" />

      <div className="grid grid-cols-1 gap-4">
        <Input label="Home Address" tone="purple" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Contact Number" tone="purple" />
          <Input label="Nationality" tone="purple" />
          <Input label="Preferred Language" tone="purple" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="School / Institution" tone="purple" />
          <Input label="Grade / Year Level" tone="purple" />
        </div>
      </div>

      <Button
        className="mt-8"
        fullWidth
        size="lg"
        onClick={() => navigate('/setup/guardian')}
      >
        Next: Guardian Info →
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupPersonal
