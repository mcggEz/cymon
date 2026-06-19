import { useNavigate } from 'react-router-dom'
import BrandHeader from '../../components/BrandHeader'
import StepProgress from '../../components/StepProgress'

const STEPS = ['Personal Info', 'Guardian', 'Clinical Info']

const ArrowLeft = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function ProfileSetupLayout({ current, children }) {
  const navigate = useNavigate()

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream px-4 pb-12 pt-16 min-[360px]:px-6 sm:px-10 select-none">
      {/* Glow Ambient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet to-pink opacity-20 blur-3xl" />

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white px-3 py-1.5 text-sm font-semibold text-charcoal/70 transition-all hover:border-violet hover:text-violet shadow-sm cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="relative mx-auto max-w-3xl">
        <BrandHeader />
        <StepProgress current={current} steps={STEPS} />
        <div className="mt-6 rounded-3xl border border-charcoal/5 bg-white p-6 shadow-[0_24px_60px_-25px_rgba(165,122,255,0.15)] min-[360px]:p-8">
          {children}
        </div>
      </div>
    </main>
  )
}

export default ProfileSetupLayout
