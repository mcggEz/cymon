import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'

const FORMS = [
  {
    id: 'admission',
    code: 'CMPS: SE-FO-01',
    title: 'Student Admission Form',
    desc: 'Personal info, parents details, diagnosis, disability, enrollment program selection.',
    icon: '⊕',
  },
  {
    id: 'sped',
    code: 'CMPS: SE-FO-02',
    title: 'SPED Consent and Waiver',
    desc: 'Parent / caregiver consent for the Special Education Program, house rules, and waiver signatures.',
    icon: '✓',
  },
  {
    id: 'summerscape',
    code: 'CMPS: SE-FO-03',
    title: 'Summerscape Consent and Waiver',
    desc: 'Consent form for the CyMon SummerScape Program including photo/video consent and waiver.',
    icon: '☀',
  },
]

function Waivers() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader title="Consents & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Filled out by Leo&apos;s parent or guardian upon enrollment and program registration.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {FORMS.map((f) => (
            <button
              key={f.id}
              onClick={() => navigate(`/client/waivers/${f.id}`)}
              className="overflow-hidden rounded-2xl border border-purple-200 bg-white text-left shadow-sm transition hover:shadow"
            >
              <div className="h-3 bg-gradient-to-r from-purple-600 to-purple-800" />
              <div className="flex items-start gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  {f.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="text-base font-semibold text-purple-800">{f.title}</div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Submitted
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                      {f.code}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default Waivers
