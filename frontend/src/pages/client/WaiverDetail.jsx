import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from './PageHeader'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import Button from '../../components/ui/Button'
import SignaturePad from '../../components/ui/SignaturePad'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
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

const SUMMERSCAPE_PROVISIONS = [
  {
    title: '1. Consent to Enrollment and Activity Participation',
    body: 'I voluntarily enroll my child in the SummerScape Program of ClearMind Psychological Services (CMPS) and agree to comply with the guidelines, schedules, and policies of the program.',
  },
  {
    title: '2. Program Schedule and Payment Conditions',
    body: 'I acknowledge that the SummerScape Program consists of ten (10) scheduled sessions, and that missed sessions are non-transferable, non-refundable, and non-convertible to cash.',
  },
  {
    title: '3. Disclosure of Special Needs and Health Conditions',
    body: 'I affirm that I have fully disclosed all relevant medical conditions, allergies, or special behavioral needs of my child to CMPS to ensure a safe environment.',
  },
  {
    title: '4. Data Privacy and Safe Video Monitoring',
    body: 'I consent to data collection for safety and program administration under the Data Privacy Act of 2012, including CCTV monitoring in clinic play and activity areas.',
  },
  {
    title: '5. Liability Release for Recreational Outings',
    body: 'I release CMPS staff and organizers from liability for any minor accidents, slips, or falls that may occur during the play-based physical activities of the program.',
  },
]

const SUMMERSCAPE_RULES = [
  'Attendance: Arrive on time to ensure maximum engagement in group games.',
  'Safety first: Follow facilitator instructions and program play rules.',
  'Cooperation: Actively communicate with clinic specialists for updates.',
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
  const [patientData, setPatientData] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    const loadWaiver = async () => {
      try {
        const d = await api.client.waiverDetails(code)
        if (!on) return
        if (d.submission) {
          setSubmission(d.submission)
          const sa = d.submission.provisions_agreed || {}
          setAgreed(sa)
          setHouseRules(d.submission.house_rules_agreed)
          setAck({
            parent_name: sa.parent_name || d.submission.signature_text || '',
            date: sa.date ? sa.date.slice(0, 10) : (d.submission.signed_at ? d.submission.signed_at.slice(0, 10) : ''),
            child_name: sa.child_name || '',
            relationship: sa.relationship || '',
          })
          setSignature(sa.signature_image || null)
        }
      } catch (e) {}

      if (code === 'CMPS:SE-FO-01' || code === 'CMPS:SE-FO-13') {
        try {
          const pd = await api.client.getPatient()
          if (!on) return
          setPatientData(pd)
          setAck((prev) => ({
            ...prev,
            parent_name: prev.parent_name || pd.guardian?.full_name || '',
            child_name: prev.child_name || `${pd.patient?.first_name} ${pd.patient?.last_name}` || '',
            relationship: prev.relationship || pd.guardian?.relationship || '',
            date: prev.date || new Date().toISOString().slice(0, 10),
          }))
        } catch (e) {}
      }
      if (on) setLoading(false)
    }

    loadWaiver()
    return () => {
      on = false
    }
  }, [code])

  const isReadOnly = submission && (submission.status === 'submitted' || submission.status === 'approved')
  const isSummerScape = code === 'CMPS:SE-FO-12'
  const isAdmissionForm = code === 'CMPS:SE-FO-01' || code === 'CMPS:SE-FO-13'

  const provisionsList = isSummerScape ? SUMMERSCAPE_PROVISIONS : PROVISIONS
  const rulesList = isSummerScape ? SUMMERSCAPE_RULES : RULES

  const formTitle = isAdmissionForm
    ? (code === 'CMPS:SE-FO-13' ? 'SUMMERSCAPE PROGRAM ENROLLMENT' : 'STUDENT ADMISSION & REGISTRATION')
    : isSummerScape
    ? 'SUMMERSCAPE PROGRAM PARENT / CAREGIVER CONSENT AND WAIVER FORM'
    : 'SPECIAL EDUCATION (SPED) PROGRAM PARENT / CAREGIVER CONSENT AND WAIVER FORM'

  const provisionKeys = provisionsList.map((p) => p.title.split('.')[0])
  const toggleProvision = (key) => {
    if (isReadOnly) return
    setAgreed((a) => ({ ...a, [key]: !a[key] }))
  }
  const setAckField = (k) => (e) => {
    if (isReadOnly) return
    setAck((x) => ({ ...x, [k]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError(null)
    if (!isAdmissionForm) {
      if (!provisionKeys.every((k) => agreed[k])) {
        setError('Please agree to all provisions before submitting.')
        return
      }
      if (!houseRules) {
        setError('Please acknowledge the clinic house rules.')
        return
      }
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
        provisions_agreed: {
          ...agreed,
          parent_name: ack.parent_name.trim(),
          date: ack.date || new Date().toISOString().slice(0, 10),
          child_name: ack.child_name.trim(),
          relationship: ack.relationship.trim(),
          signature_image: signature,
        },
        house_rules_agreed: isAdmissionForm ? true : houseRules,
        signature_text: ack.parent_name.trim(),
      })
      navigate('/client/waivers')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderAdmissionForm = () => {
    const p = patientData?.patient
    const g = patientData?.guardian
    const em = patientData?.emergency
    const cl = patientData?.clinical

    if (!patientData) {
      return <div className="text-center text-slate-500 py-6">No enrollment data found. Please complete admission details.</div>
    }

    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-base font-semibold text-purple-800 border-b border-purple-50 pb-2">Student Information</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Full Name</span>
              <span className="font-semibold text-slate-800">{p?.first_name} {p?.middle_name || ''} {p?.last_name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Nickname</span>
              <span className="font-semibold text-slate-800">{p?.nick_name || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Date of Birth</span>
              <span className="font-semibold text-slate-800">{p?.date_of_birth}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Sex</span>
              <span className="font-semibold text-slate-800 capitalize">{p?.sex}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-slate-500 block">Home Address</span>
              <span className="font-semibold text-slate-800">{p?.home_address || '—'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-base font-semibold text-purple-800 border-b border-purple-50 pb-2">Guardian & Emergency Information</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Primary Guardian</span>
              <span className="font-semibold text-slate-800">{g?.full_name || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Relationship</span>
              <span className="font-semibold text-slate-800">{g?.relationship || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Contact Number</span>
              <span className="font-semibold text-slate-800">{g?.contact_number || '—'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Email</span>
              <span className="font-semibold text-slate-800">{g?.email || '—'}</span>
            </div>
            <div className="border-t border-purple-50 pt-2 col-span-2">
              <span className="text-xs text-slate-500 block">Emergency Contact Person</span>
              <span className="font-semibold text-slate-800">{em?.full_name || '—'} ({em?.relationship})</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-slate-500 block">Emergency Contact Number</span>
              <span className="font-semibold text-slate-800">{em?.contact_number || '—'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-base font-semibold text-purple-800 border-b border-purple-50 pb-2">Clinical Details</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">Disability</span>
              <span className="font-semibold text-slate-800">{p?.disability || 'None'}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Diagnosis</span>
              <span className="font-semibold text-slate-800">{cl?.primary_diagnosis || 'Pending'}</span>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Consents & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/client/waivers')}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          Back
        </button>

        <h1 className="text-center text-xl font-bold tracking-wider text-purple-800 uppercase">
          {formTitle}
        </h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          ClearMind Psychological Services
        </p>

        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-28 w-full" rounded="rounded-2xl" />
            <SkeletonText lines={10} />
          </div>
        ) : (
          <>
            {isAdmissionForm ? (
              <div className="mt-6">{renderAdmissionForm()}</div>
            ) : (
              <>
                <section className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm text-slate-700">
                  <div className="font-semibold text-purple-800">Nature and Scope of the Program</div>
                  <p className="mt-1">
                    The {isSummerScape ? 'SummerScape' : 'Special Education (SPED)'} Program of ClearMind Psychological Services is designed
                    to provide developmental, academic, and behavioral support for children. By signing this consent, the parent/caregiver agrees to the terms
                    and provisions outlined below.
                  </p>
                </section>

                <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="text-base font-semibold text-purple-800">
                    Provisions and Agreement
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    {provisionsList.map((p) => (
                      <div key={p.title} className="border-l-2 border-purple-300 pl-3">
                        <div className="text-sm font-semibold text-purple-800">{p.title}</div>
                        <p className="mt-1 text-sm text-slate-700">{p.body}</p>
                        <Checkbox
                          className="mt-2"
                          label={`I agree to the terms in ${p.title.split('.')[0]}.`}
                          checked={!!agreed[p.title.split('.')[0]]}
                          onChange={() => toggleProvision(p.title.split('.')[0])}
                          disabled={isReadOnly}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="text-base font-semibold text-purple-800">Clinic&apos;s House Rules</div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {rulesList.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <Checkbox
                    className="mt-3"
                    label="I acknowledge and agree to abide by these house rules."
                    checked={houseRules}
                    onChange={(e) => {
                      if (isReadOnly) return
                      setHouseRules(e.target.checked)
                    }}
                    disabled={isReadOnly}
                  />
                </section>
              </>
            )}

            <section className="mt-5 rounded-2xl border border-purple-200 bg-emerald-50 p-5">
              <div className="text-base font-semibold text-emerald-800">
                Parent / Caregiver Acknowledgement
              </div>
              <p className="mt-1 text-sm text-slate-700">
                I have read and understood this form and willingly submit this acknowledgement for my child.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Parent / Guardian Full Name"
                  tone="purple"
                  value={ack.parent_name}
                  onChange={setAckField('parent_name')}
                  disabled={isReadOnly}
                />
                <Input
                  label="Date"
                  type="date"
                  tone="purple"
                  value={ack.date}
                  onChange={setAckField('date')}
                  disabled={isReadOnly}
                />
                <Input
                  label="Child / Student Full Name"
                  tone="purple"
                  value={ack.child_name}
                  onChange={setAckField('child_name')}
                  disabled={isReadOnly}
                />
                <Input
                  label="Relationship"
                  tone="purple"
                  value={ack.relationship}
                  onChange={setAckField('relationship')}
                  disabled={isReadOnly}
                />
              </div>

              {isReadOnly ? (
                <div className="mt-4 rounded-lg border border-purple-200 bg-white p-3">
                  <div className="mb-2 text-xs font-semibold text-emerald-800">Parent / Guardian E-Signature</div>
                  {signature ? (
                    <img src={signature} alt="Signature" className="mx-auto max-h-32" />
                  ) : (
                    <div className="text-slate-400 text-sm italic">No signature image submitted</div>
                  )}
                </div>
              ) : (
                <SignaturePad
                  className="mt-4"
                  label="Parent / Guardian E-Signature"
                  value={signature}
                  onChange={setSignature}
                />
              )}
            </section>

            {error ? (
              <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}

            {!isReadOnly && (
              <Button className="mt-4" fullWidth size="lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit acknowledgement'}
              </Button>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default WaiverDetail
