import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from './PageHeader'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import Button from '../../components/ui/Button'
import SignaturePad from '../../components/ui/SignaturePad'
import { api } from '../../lib/api'

const PROVISIONS = [
  {
    title: '1. Consent to Enrollment and Participation',
    body:
      'I voluntarily enroll my child in the Special Education Program (SPED) of ClearMind Psychological Services (CMPS) and agree to comply with the policies, schedules, and procedures of the program.',
  },
  {
    title: '2. Authority to Provide Services',
    body:
      'I authorize the SPED teachers, therapists, and clinicians of CMPS to provide developmental, behavioral, and therapeutic interventions appropriate to my child&apos;s needs.',
  },
  {
    title: '3. Confidentiality of Records',
    body:
      'I understand that my child&apos;s records will be kept confidential in accordance with the Data Privacy Act of 2012 and will only be released with my written consent.',
  },
  {
    title: '4. Photo & Video Release',
    body:
      'I grant permission to CMPS to use photos / videos of my child for documentation and program promotion purposes only.',
  },
  {
    title: '5. Liability Waiver',
    body:
      'I acknowledge that I have read and understood the program guidelines and release CMPS from liability for incidents beyond reasonable care.',
  },
  {
    title: '6. Financial Commitment',
    body:
      'I commit to the tuition, materials, and assessment fees scheduled for the SPED program and understand the refund and cancellation policy.',
  },
]

const RULES = [
  'Attendance: Regular attendance is required for steady progress.',
  'Punctuality: Arrive 10 minutes before the scheduled session.',
  'Behavior: Aggressive or disruptive behavior must be discussed with the program lead.',
  'Materials: Bring assigned materials and learning aids each session.',
  'Communication: Email or message the assigned clinician for concerns.',
  'Policy Updates: CMPS may amend the program policies; updates will be communicated in writing.',
]

function WaiverDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const code = decodeURIComponent(id || '')
  const [signature, setSignature] = useState(null)
  const [agreed, setAgreed] = useState({})
  const [houseRules, setHouseRules] = useState(false)
  const [ack, setAck] = useState({ parent_name: '', date: '', child_name: '', relationship: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const provisionKeys = PROVISIONS.map((p) => p.title.split('.')[0])
  const toggleProvision = (key) => setAgreed((a) => ({ ...a, [key]: !a[key] }))
  const setAckField = (k) => (e) => setAck((x) => ({ ...x, [k]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    if (!provisionKeys.every((k) => agreed[k])) {
      setError('Please agree to all provisions before submitting.')
      return
    }
    if (!houseRules) {
      setError('Please acknowledge the clinic house rules.')
      return
    }
    if (!ack.parent_name.trim()) {
      setError('Parent / guardian full name is required.')
      return
    }
    if (!signature) {
      setError('Your e-signature is required.')
      return
    }
    setSubmitting(true)
    try {
      await api.client.submitWaiver(code, {
        provisions_agreed: Object.fromEntries(provisionKeys.map((k) => [k, true])),
        house_rules_agreed: true,
        signature_text: ack.parent_name.trim(),
      })
      navigate('/client/waivers')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Consents & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/client/waivers')}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          ← Back
        </button>

        <h1 className="text-center text-xl font-bold tracking-wider text-purple-800">
          SPECIAL EDUCATION (SPED) PROGRAM
          <br />
          PARENT / CAREGIVER CONSENT AND WAIVER FORM
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          ClearMind Psychological Services
        </p>

        <section className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm text-slate-700">
          <div className="font-semibold text-purple-800">Nature and Scope of the Program</div>
          <p className="mt-1">
            The Special Education (SPED) Program of ClearMind Psychological Services is designed
            to provide developmental, academic, and behavioral support for children with special
            learning needs. By signing this consent, the parent/caregiver agrees to the terms
            and provisions outlined below.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold text-purple-800">
            Provisions and Agreement
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {PROVISIONS.map((p) => (
              <div key={p.title} className="border-l-2 border-purple-300 pl-3">
                <div className="text-sm font-semibold text-purple-800">{p.title}</div>
                <p className="mt-1 text-sm text-slate-700">{p.body}</p>
                <Checkbox
                  className="mt-2"
                  label={`I agree to the terms in ${p.title.split('.')[0]}.`}
                  checked={!!agreed[p.title.split('.')[0]]}
                  onChange={() => toggleProvision(p.title.split('.')[0])}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold text-purple-800">Clinic&apos;s House Rules</div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Checkbox
            className="mt-3"
            label="I acknowledge and agree to abide by these house rules."
            checked={houseRules}
            onChange={(e) => setHouseRules(e.target.checked)}
          />
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-emerald-50 p-5">
          <div className="text-base font-semibold text-emerald-800">
            Parent / Caregiver Acknowledgement
          </div>
          <p className="mt-1 text-sm text-slate-700">
            I have read and understood the consent and waiver form and willingly enroll my child
            in the SPED Program of ClearMind Psychological Services.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Parent / Guardian Full Name" tone="purple" value={ack.parent_name} onChange={setAckField('parent_name')} />
            <Input label="Date" type="date" tone="purple" value={ack.date} onChange={setAckField('date')} />
            <Input label="Child / Student Full Name" tone="purple" value={ack.child_name} onChange={setAckField('child_name')} />
            <Input label="Relationship" tone="purple" value={ack.relationship} onChange={setAckField('relationship')} />
          </div>

          <SignaturePad
            className="mt-4"
            label="Parent / Guardian E-Signature"
            value={signature}
            onChange={setSignature}
          />
        </section>

        {error ? (
          <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <Button className="mt-4" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : '✓ Submit Consent and Waiver'}
        </Button>
      </div>
    </>
  )
}

export default WaiverDetail
