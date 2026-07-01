import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ProfileSetupLayout from './ProfileSetupLayout'
import { api } from '../../lib/api'
import { getSetupDraft, clearSetupDraft } from './setupDraft'

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
  const [clinical, setClinical] = useState(() => ({
    primary_diagnosis: '',
    iep_level: '',
    secondary_diagnosis: '',
    date_enrolled: '',
    referral_source: '',
    ...(getSetupDraft().clinical || {}),
  }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const setC = (k) => (e) => setClinical((c) => ({ ...c, [k]: e.target.value }))

  const handleComplete = async () => {
    setError(null)
    const draft = getSetupDraft()
    if (!draft.patient) {
      setError('Your enrollment session expired. Please start again from Personal Information.')
      return
    }
    setSubmitting(true)
    try {
      await api.client.createPatient({
        patient: draft.patient,
        guardian: draft.guardian || {},
        emergency: draft.emergency || {},
        clinical,
      })
      clearSetupDraft()
      navigate('/client/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProfileSetupLayout current={3}>
      <h1 className="text-3xl font-bold text-purple-800">Clinical Information</h1>
      <p className="mt-1 text-sm text-slate-600">
        The information is kept confidential and used only for intervention planning.
      </p>

      <SectionDivider label="DIAGNOSIS" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Primary Diagnosis (ICD-10)" placeholder="Select Diagnosis" value={clinical.primary_diagnosis} onChange={setC('primary_diagnosis')}>
          <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
          <option value="ADHD">ADHD</option>
          <option value="Other">Other</option>
        </Select>
        <Input label="IEP Level" tone="purple" value={clinical.iep_level} onChange={setC('iep_level')} />
        <Input label="Secondary Diagnosis (optional)" tone="purple" value={clinical.secondary_diagnosis} onChange={setC('secondary_diagnosis')} />
      </div>

      <SectionDivider label="ENROLLMENT" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Date of Enrollment" type="date" tone="purple" value={clinical.date_enrolled} onChange={setC('date_enrolled')} />
        <Input label="Referral Source" tone="purple" value={clinical.referral_source} onChange={setC('referral_source')} />
      </div>

      {error ? (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <Button className="mt-8" fullWidth size="lg" onClick={handleComplete} disabled={submitting}>
        {submitting ? 'Saving…' : 'Complete Profile'}
      </Button>
    </ProfileSetupLayout>
  )
}

export default ProfileSetupClinical
