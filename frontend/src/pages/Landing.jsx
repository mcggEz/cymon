import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

const Butterfly = ({ className = '', flip = false }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    <ellipse cx="60" cy="60" rx="2.5" ry="30" fill="currentColor" />
    <ellipse cx="40" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="80" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="44" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <ellipse cx="76" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
  </svg>
)

const Feature = ({ icon, title, body }) => (
  <article className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-700">
      {icon}
    </div>
    <div className="mt-4 text-lg font-semibold text-purple-800">{title}</div>
    <p className="mt-1 text-sm text-slate-600">{body}</p>
  </article>
)

const RoleCard = ({ icon, title, body, to, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className="group rounded-2xl border border-purple-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-xl text-white">
      {icon}
    </div>
    <div className="mt-4 text-lg font-semibold text-purple-800">{title}</div>
    <p className="mt-1 text-sm text-slate-600">{body}</p>
    <div className="mt-3 text-sm font-medium text-purple-700 group-hover:text-purple-900">
      Continue →
    </div>
  </button>
)

function Landing() {
  const navigate = useNavigate()
  return (
    <main className="min-h-dvh bg-[#efeaf7]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-purple-700">
          <Butterfly className="h-9 w-9" />
          <div className="leading-tight">
            <div className="font-serif italic text-2xl font-semibold text-purple-800">CyMon</div>
            <div className="text-[10px] tracking-[0.25em] text-purple-700/80">
              CLEARMIND · PSYCHOLOGICAL SERVICES
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-purple-800 sm:flex">
          <a href="#about" className="hover:text-purple-900">About</a>
          <a href="#features" className="hover:text-purple-900">Features</a>
          <a href="#roles" className="hover:text-purple-900">Portals</a>
          <a href="#contact" className="hover:text-purple-900">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate('/setup/personal')}>
            Get Started
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold tracking-wider text-purple-700">
            ✦ NEW · CyMon 2026 Platform
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-purple-900 sm:text-5xl">
            One portal for every step of a child&apos;s{' '}
            <span className="text-purple-700">developmental journey</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            CyMon brings together caregivers, psychologists, psychometricians, and clinic admins on
            a single, secure platform — from intake and assessments to interventions, progress
            tracking, and family communication.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/setup/personal')}>
              Enroll a child →
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
              Sign in to your portal
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-5 text-xs text-slate-500">
            <span>🛡 Data Privacy Act of 2012 compliant</span>
            <span>NPC Circular 2023-04</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-purple-300/40 to-purple-700/30 blur-xl" />
          <div className="relative rounded-3xl bg-gradient-to-br from-purple-700 to-purple-900 p-8 text-white shadow-xl">
            <Butterfly className="absolute right-6 top-6 h-24 w-24 text-purple-300/40" />
            <div className="relative">
              <div className="text-xs tracking-[0.25em] text-purple-200/80">
                CLEARMIND · PSYCHOLOGICAL SERVICES
              </div>
              <div className="mt-2 font-serif italic text-6xl font-semibold drop-shadow">CyMon</div>
              <ul className="mt-6 space-y-3 text-sm text-purple-100">
                <li className="flex items-center gap-2">✓ Caregiver portal with daily activity logs</li>
                <li className="flex items-center gap-2">✓ Standardized assessments (MMSE, CAFAT, GARS)</li>
                <li className="flex items-center gap-2">✓ Behavioral reports with digital signatures</li>
                <li className="flex items-center gap-2">✓ Clinic master schedule and compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold tracking-wider text-purple-700">FEATURES</div>
          <h2 className="mt-2 text-3xl font-bold text-purple-900">
            Designed around the clinic&apos;s real workflow
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every screen mirrors the forms and routines already in use at ClearMind, so onboarding
            takes hours — not weeks.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="📋" title="Intake & profiling" body="Guided 3-step admission for caregivers with clinical, guardian, and emergency details." />
          <Feature icon="🧠" title="Standardized assessments" body="MMSE, CAFAT, GARS-3 with auto-scored cognition and behavioral indicators." />
          <Feature icon="📊" title="Progress tracking" body="Monthly PSR reports, IEP levels, mainstreaming readiness, and weekly mood charts." />
          <Feature icon="📅" title="Master schedule" body="Calendar view across all practitioners with one-click appointment booking." />
          <Feature icon="🛡" title="Compliance & waivers" body="Track overdue forms, pending signatures, and remind families automatically." />
          <Feature icon="📢" title="Family communication" body="Announcements, clinic events, and direct clinician notes in the parent portal." />
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold tracking-wider text-purple-700">PORTALS</div>
          <h2 className="mt-2 text-3xl font-bold text-purple-900">Built for every role</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose your portal and continue — each role has the exact tools and forms they need.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RoleCard navigate={navigate} icon="👨‍👩‍👧" title="Caregiver" body="Daily logs, assessments, appointments, and clinician notes for your child." to="/login" />
          <RoleCard navigate={navigate} icon="🧑‍⚕️" title="Psychologist" body="Approvals, roster, mainstreaming readiness, interventions, and progress." to="/login" />
          <RoleCard navigate={navigate} icon="📝" title="Psychometrician" body="Tasks, tool library, caregiver data review, activity logs, and report drafting." to="/login" />
          <RoleCard navigate={navigate} icon="🛠" title="Clinic Admin" body="Overview, patients, compliance, schedule, scoring, documents, announcements." to="/login" />
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12">
          <div>
            <div className="text-xs font-semibold tracking-wider text-purple-700">ABOUT THE CLINIC</div>
            <h2 className="mt-2 text-3xl font-bold text-purple-900">ClearMind Psychological Services</h2>
            <p className="mt-3 text-sm text-slate-600">
              Serving Brgy. Banilad &amp; Brgy. Maryferns, Calauan City. ClearMind delivers
              compassionate developmental assessments, personalized early-intervention plans, and
              dedicated support for families.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Special Education (SPED) Program</li>
              <li>• CyMon SummerScape</li>
              <li>• Therapy &amp; follow-up sessions with licensed clinicians</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-purple-50 p-6">
            <div className="text-sm font-semibold text-purple-800">Contact</div>
            <div className="mt-2 text-sm text-slate-700">
              Blk 1 Lot 7 Painsville Subdivision, Brgy. Banilo, Calauan City, Laguna 4025
            </div>
            <div className="mt-2 text-sm text-slate-700">clearmind.psychservices@gmail.com</div>
            <div className="text-sm text-slate-700">+63 992-918-4078</div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => navigate('/setup/personal')}>
                Enroll now
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 text-purple-700">
          <Butterfly className="h-7 w-7" />
          <div className="font-serif italic text-xl font-semibold">CyMon</div>
          <Butterfly className="h-7 w-7" flip />
        </div>
        <div className="mt-2">© 2026 ClearMind Psychological Services · Data Privacy Act of 2012 · NPC Circular 2023-04</div>
      </footer>
    </main>
  )
}

export default Landing
