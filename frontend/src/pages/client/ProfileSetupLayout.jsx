import BrandHeader from '../../components/BrandHeader'
import StepProgress from '../../components/StepProgress'

const STEPS = ['Personal Info', 'Guardian', 'Clinical Info']

function ProfileSetupLayout({ current, children }) {
  return (
    <main className="min-h-dvh bg-[#efeaf7] px-4 pb-10 min-[360px]:px-6 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <BrandHeader />
        <StepProgress current={current} steps={STEPS} />
        <div className="mt-6 rounded-2xl border-2 border-purple-300 bg-white p-6 min-[360px]:p-8">
          {children}
        </div>
      </div>
    </main>
  )
}

export default ProfileSetupLayout
