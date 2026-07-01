import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ProfileSetupLayout from './ProfileSetupLayout'
import { useAuth } from '../../auth/useAuth'
import { mergeSetupDraft, getSetupDraft } from './setupDraft'

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
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [child, setChild] = useState(() => ({
    first_name: '',
    middle_name: '',
    last_name: '',
    nick_name: '',
    date_of_birth: '',
    sex: '',
    home_address: '',
    contact_number: '',
    nationality: '',
    preferred_language: '',
    school: '',
    grade_level: '',
    ...(getSetupDraft().patient || {}),
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const setC = (k) => (e) => setChild((c) => ({ ...c, [k]: e.target.value }))

  const handleNext = async () => {
    setError(null)
    setNotice(null)

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!child.first_name || !child.last_name) {
      setError("Child's first and last name are required.")
      return
    }
    if (!child.date_of_birth || !child.sex) {
      setError("Child's date of birth and sex are required.")
      return
    }

    setSubmitting(true)
    const displayName = [child.first_name, child.last_name].filter(Boolean).join(' ').trim() || email

    try {
      const data = await signUp({ email, password, displayName, role: 'client' })
      if (data.session) {
        mergeSetupDraft({ patient: child })
        navigate('/setup/guardian')
      } else {
        setNotice(
          'Account created. Check your email to confirm your address, then log in to continue.'
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProfileSetupLayout current={1}>
      <h1 className="text-3xl font-bold text-purple-800">Personal Information</h1>
      <p className="mt-1 text-sm text-slate-600">
        Tell us about the child being enrolled
      </p>

      <SectionDivider label="ACCOUNT" />

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          tone="purple"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            tone="purple"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            tone="purple"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      </div>

      <SectionDivider label="CHILD'S INFORMATION" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Upload profile photo"
          className="group flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-purple-100 text-purple-700 ring-1 ring-purple-200 transition hover:bg-purple-200 hover:text-purple-800 hover:ring-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 active:scale-95"
        >
          <span className="transition-transform group-hover:scale-110">
            <CameraIcon />
          </span>
        </button>
        <div>
          <div className="text-sm font-medium text-purple-800">Upload profile photo</div>
          <div className="text-xs text-slate-500">JPG, PNG up to 5 MB · optional</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="First Name" tone="purple" value={child.first_name} onChange={setC('first_name')} />
        <Input label="Middle Name" tone="purple" value={child.middle_name} onChange={setC('middle_name')} />
        <Input label="Last Name" tone="purple" value={child.last_name} onChange={setC('last_name')} />
        <Input label="Nick Name" tone="purple" value={child.nick_name} onChange={setC('nick_name')} />
        <Input label="Date of Birth" type="date" tone="purple" value={child.date_of_birth} onChange={setC('date_of_birth')} />
        <Select label="Sex" placeholder="Select" value={child.sex} onChange={setC('sex')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </div>

      <SectionDivider label="CONTACT & LOCATION" />

      <div className="grid grid-cols-1 gap-4">
        <Input label="Home Address" tone="purple" value={child.home_address} onChange={setC('home_address')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Contact Number" tone="purple" value={child.contact_number} onChange={setC('contact_number')} />
          <Input label="Nationality" tone="purple" value={child.nationality} onChange={setC('nationality')} />
          <Input label="Preferred Language" tone="purple" value={child.preferred_language} onChange={setC('preferred_language')} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="School / Institution" tone="purple" value={child.school} onChange={setC('school')} />
          <Input label="Grade / Year Level" tone="purple" value={child.grade_level} onChange={setC('grade_level')} />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      <Button
        className="mt-8"
        fullWidth
        size="lg"
        onClick={handleNext}
        disabled={submitting}
      >
        {submitting ? 'Creating account…' : 'Next: Guardian Info →'}
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupPersonal
