import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'

const DOMAINS = [
  {
    n: 'I.',
    title: 'PRACTICAL DOMAIN',
    score: '4/5',
    rows: [
      'Appearance',
      'Dresses appropriate to the occasion',
      'B. ACTIVITIES OF DAILY LIVING',
      'Opens a simple container or jar',
      'Can demonstrate handwashing when asked',
      'Removes a pack of confectionery when craving',
      'Can independently drink from a cup or bottle',
    ],
  },
  {
    n: 'II.',
    title: 'CONCEPTUAL DOMAIN',
    score: '4/5',
    rows: [
      'A. OBJECT RECOGNITION',
      'Names at least six (6) familiar objects (ex: bottle)',
      'Counts 0–10, familiar faces (mother, father)',
      'B. IDENTIFYING DETAILS',
      'Can name his/her own name',
      'Knows full name when asked',
      'C. RACE ASSOCIATION',
      'Connects similar entities under one age',
    ],
  },
  {
    n: 'III.',
    title: 'AFFECT & INTERACTION',
    score: '4/5',
    rows: [
      'A. EMOTIONAL',
      'Makes eye contact when name is called',
      'Responds to greetings (verbal or gesture)',
      'Can show emotions (happy, sad)',
      'Cries when age appropriate distress',
      'Can identify basic emotions',
    ],
  },
  {
    n: 'IV.',
    title: 'BODILY KINESTHETIC DOMAIN',
    score: '4/5',
    rows: [
      'A. FINE MOTOR SKILLS',
      'Can hold drug ID appropriately (pencil)',
      'Writes letters or name legibly',
      'B. GROSS MOTOR SKILLS',
      'Can demonstrate hand-eye coordination (sharing)',
      'Can pin face shape (circle, triangle, square)',
      'C. SOCIAL MOTOR SKILLS',
      'Can stand on one foot briefly',
      'Walks steadily across the room',
      'Can jump forward with both feet together',
      'Climbs stairs using alternating feet',
    ],
  },
  {
    n: 'V.',
    title: 'PERCEPTUAL DISTURBANCES & STIMMING',
    score: '4/5',
    rows: [
      'PERCEPTUAL DISTURBANCES',
      'Hallucinations',
      'Delusions',
      'Illusions',
      'STIMMING',
      'Verbal automatic vocalizations',
      'Hand flapping',
      'Body rocking, head banging or spinning around',
    ],
  },
]

function DomainCard({ d }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
      <header className="flex items-center justify-between bg-purple-700 px-4 py-2 text-white">
        <div className="text-sm font-semibold tracking-wider">
          {d.n} {d.title}
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">{d.score}</span>
      </header>
      <div className="divide-y divide-purple-100">
        {d.rows.map((row, i) => {
          const isHeader = row === row.toUpperCase() && row.length > 2
          return isHeader ? (
            <div key={i} className="bg-purple-50 px-4 py-2 text-[11px] font-semibold tracking-wider text-purple-700">
              {row}
            </div>
          ) : (
            <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2">
              <div className="text-sm text-slate-700">{row}</div>
              <div className="flex gap-1.5">
                <button className="rounded-md bg-green-500 px-3 py-1 text-xs font-medium text-white">
                  Yes
                </button>
                <button className="rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white">
                  No
                </button>
              </div>
              <input
                placeholder="Remarks…"
                className="h-8 rounded-md border border-purple-200 bg-purple-50 px-2 text-xs"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AssessmentDetail() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Assessment Center" />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/client/assessments')}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          ← Back
        </button>

        <h1 className="text-center text-2xl font-bold tracking-wider text-purple-800">
          MINI-MENTAL STATUS EXAMINATION
        </h1>
        <p className="text-center text-xs uppercase tracking-wider text-slate-500">
          Complete the sections below
        </p>

        <section className="mt-4 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold text-purple-800">
            ✦ Personal Information of Student
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Full Name" tone="purple" />
            <Input label="Date of Exam" type="date" tone="purple" />
            <Select label="Mood" placeholder="Select Mood">
              <option>Happy</option>
              <option>Okay</option>
              <option>Sad</option>
            </Select>
            <Input label="Age / Time" tone="purple" />
            <Input label="Date of Birth" type="date" tone="purple" />
            <Select label="Diagnosis" placeholder="Specify if any">
              <option>ASD</option>
              <option>ADHD</option>
            </Select>
          </div>
          <Textarea className="mt-4" label="Medical History" rows={2} />
          <Textarea className="mt-4" label="Family History" rows={2} />
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {DOMAINS.map((d) => (
            <DomainCard key={d.title} d={d} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Cognition Score
            </div>
            <div className="text-xs text-slate-500">
              Auto-computed once you complete all the items in the assessment.
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-800">12 / 28</div>
        </div>

        <Button className="mt-4" fullWidth size="lg" onClick={() => navigate('/client/assessments')}>
          ✓ Submit Assessment
        </Button>
      </div>
    </>
  )
}

export default AssessmentDetail
