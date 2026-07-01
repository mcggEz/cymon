import { useState } from 'react'
import StaffHeader from '../StaffHeader'

// The Intake Interview is the first assessment an MHP records before treatment
// begins. It captures the patient's presenting concerns, background, and initial
// observations. Persistence is wired once the intake tables land; the form holds
// its own state so clinicians can draft and review the layout today.

const Labeled = ({ label, children, full = false }) => (
  <label className={`block text-sm ${full ? 'sm:col-span-2' : ''}`}>
    <div className="font-semibold text-purple-700">{label}</div>
    {children}
  </label>
)

const Text = (props) => (
  <input {...props} className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
)

const Area = ({ rows = 3, ...props }) => (
  <textarea rows={rows} {...props} className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm" />
)

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div className="text-sm font-semibold text-purple-800">{title}</div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </section>
)

const blank = {
  patient: '',
  date: '',
  informant: '',
  concerns: '',
  onset: '',
  background: '',
  developmental: '',
  medical: '',
  family: '',
  observations: '',
}

function IntakeInterview() {
  const [form, setForm] = useState(blank)
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setSaved(false)
  }

  const save = (e) => {
    e.preventDefault()
    setSaved(true)
  }

  return (
    <>
      <StaffHeader title="Intake Interview" showSearch={false} />
      <form onSubmit={save} className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          First assessment before treatment — record the patient&apos;s concerns, background, and
          initial observations.
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <Section title="Session">
            <Labeled label="Patient">
              <Text value={form.patient} onChange={set('patient')} placeholder="Full name" />
            </Labeled>
            <Labeled label="Date of Interview">
              <Text type="date" value={form.date} onChange={set('date')} />
            </Labeled>
            <Labeled label="Informant / Relationship" full>
              <Text value={form.informant} onChange={set('informant')} placeholder="e.g. Mother, Guardian" />
            </Labeled>
          </Section>

          <Section title="Presenting Concerns">
            <Labeled label="Main concerns" full>
              <Area rows={3} value={form.concerns} onChange={set('concerns')} placeholder="Why is the patient being brought in for consultation?" />
            </Labeled>
            <Labeled label="Onset & duration" full>
              <Area rows={2} value={form.onset} onChange={set('onset')} placeholder="When did the concerns begin and how have they progressed?" />
            </Labeled>
          </Section>

          <Section title="History & Background">
            <Labeled label="Background information" full>
              <Area rows={3} value={form.background} onChange={set('background')} placeholder="Relevant history, prior services, schooling…" />
            </Labeled>
            <Labeled label="Developmental history">
              <Area rows={3} value={form.developmental} onChange={set('developmental')} placeholder="Milestones, delays…" />
            </Labeled>
            <Labeled label="Medical history">
              <Area rows={3} value={form.medical} onChange={set('medical')} placeholder="Diagnoses, medications, allergies…" />
            </Labeled>
            <Labeled label="Family & social" full>
              <Area rows={2} value={form.family} onChange={set('family')} placeholder="Household, family dynamics, support system…" />
            </Labeled>
          </Section>

          <Section title="Initial Observations">
            <Labeled label="Clinician observations" full>
              <Area rows={3} value={form.observations} onChange={set('observations')} placeholder="Behavior, affect, rapport, engagement during the interview…" />
            </Labeled>
          </Section>

          {saved ? (
            <div className="rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              Intake interview saved. Continue to the Initial Impression next.
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="rounded-md bg-purple-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
            >
              Save Intake Interview
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default IntakeInterview
