import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Checkbox from '../components/ui/Checkbox'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useAuth } from '../auth/useAuth'

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

const EyeIcon = ({ open, className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    {open ? (
      <>
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </>
    ) : (
      <>
        <path
          d="M3 3l18 18M10.6 6.1A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.2 4M6.6 7.6A17 17 0 0 0 2 12s3.5 6 10 6c1.4 0 2.6-.3 3.7-.7M9.9 9.9a3 3 0 0 0 4.2 4.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
)

function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const destinationFor = (r) => {
    if (r === 'admin') return '/admin'
    if (r === 'psychometrician' || r === 'speech_therapist') return '/psychometrician'
    if (r === 'psychologist') return '/psychologist'
    if (r === 'occupational_therapist') return '/occupational'
    return '/client/home'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const { profile } = await signIn(email, password)
      navigate(destinationFor(profile.role))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {submitting ? <LoadingScreen label="Signing in…" /> : null}
      <main
        className="relative min-h-screen overflow-hidden text-charcoal flex flex-col items-center justify-center p-4"
        style={{ background: 'radial-gradient(circle at 50% 20%, #ede9fe 0%, #d8ccf7 45%, #c4b5fd 100%)' }}
      >
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white px-3 py-1.5 text-sm font-semibold text-charcoal/70 transition-all hover:border-violet hover:text-violet shadow-sm cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Soft ambient glow behind the card */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[42rem] w-[75rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(221,128,188,0.12) 45%, transparent 70%)' }}
      />

      <section className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_30px_80px_-25px_rgba(124,58,237,0.35)] ring-1 ring-violet/10 grid grid-cols-1 md:grid-cols-12">
        {/* Sidebar Brand Column (Visible on md+) */}
        <aside className="relative hidden md:flex md:col-span-5 bg-gradient-to-br from-purple-50 via-white to-purple-50 border-r border-purple-100/70 p-12 min-h-[32rem] flex-col justify-center overflow-hidden">
          <div className="relative z-10">
            <img src="/logo-cymon.png" alt="CyMon" className="mb-5 block h-16 w-16 rounded-2xl object-cover shadow-sm" />
            <span className="font-serif italic text-6xl font-bold text-charcoal">CyMon</span>
            <p className="mt-4 max-w-xs text-sm text-slate-600 leading-relaxed">
              Compassionate care, organized. A digital home for the SPED program at ClearMind Psychological Services.
            </p>
          </div>
        </aside>

        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="p-8 md:p-12 md:col-span-7 flex flex-col gap-5 justify-center"
        >
          {/* Mobile-only logo */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <img src="/logo-cymon.png" alt="CyMon" className="h-8 w-8 rounded-lg object-cover" />
            <div className="leading-tight text-left">
              <div className="text-sm font-bold text-charcoal">CyMon</div>
              <div className="font-mono text-[7px] tracking-[0.2em] text-slate-400">CLEARMIND · PSYCHOLOGICAL SERVICES</div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              Sign in to access assessments, intervention plans, and specialist summaries.
            </p>
          </div>

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 bottom-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-violet/10 hover:text-violet"
            >
              <EyeIcon open={showPassword} className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="text-slate-700 font-medium"
            />
            <a
              href="#forgot"
              className="text-xs font-bold text-violet hover:text-violet-dark"
            >
              Forgot password?
            </a>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 font-medium"
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={submitting}
            className="bg-violet hover:bg-violet-dark text-white font-sans tracking-wide text-base py-3.5 rounded-full mt-2 font-bold shadow-sm cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {submitting ? 'Signing in…' : 'Log in'}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-2 font-medium">
            Need an account? Please contact the ClearMind admin office to be registered.
          </p>
        </form>
      </section>
      </main>
    </>
  )
}

export default Login
