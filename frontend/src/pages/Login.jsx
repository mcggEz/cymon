import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Checkbox from '../components/ui/Checkbox'
import SegmentedControl from '../components/ui/SegmentedControl'
import { supabase, supabaseConfigured } from '../lib/supabase'

const BrandMark = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      d="M32 10c-4 6-10 8-16 8 0 10 6 18 16 22 10-4 16-12 16-22-6 0-12-2-16-8z"
      fill="currentColor"
      opacity="0.9"
    />
    <circle cx="32" cy="30" r="3" fill="white" />
  </svg>
)

const Butterfly = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <ellipse cx="60" cy="60" rx="2.5" ry="30" fill="currentColor" />
    <ellipse cx="40" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="80" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="44" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <ellipse cx="76" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <path d="M60 34 Q52 22 46 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M60 34 Q68 22 74 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const destinationFor = (r) => {
    if (r === 'admin') return '/admin'
    if (r === 'psychometrician') return '/psychometrician'
    if (r === 'psychologist') return '/psychologist'
    return '/client/home'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Could not load your profile. Contact your administrator.')
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    if (role === 'client' && profile.role !== 'client') {
      setError(`This account is registered as ${profile.role}, not client.`)
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    navigate(destinationFor(profile.role))
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#efeaf7] flex flex-col items-center justify-center p-4 min-[360px]:p-6 sm:p-10">
      <header className="flex items-center gap-3 py-4 min-[360px]:py-6 sm:py-8 text-purple-700">
        <BrandMark className="h-8 w-8 min-[360px]:h-10 min-[360px]:w-10" />
        <div className="leading-tight">
          <div className="text-xl min-[360px]:text-2xl font-semibold">ClearMind</div>
          <div className="text-[10px] min-[360px]:text-xs tracking-[0.25em] text-purple-700/80">
            PSYCHOLOGICAL SERVICES
          </div>
        </div>
      </header>

      <section className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <aside className="relative bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 min-[360px]:p-8 sm:p-10 min-h-56 md:min-h-[26rem] flex flex-col justify-between overflow-hidden">
          <Butterfly className="absolute right-4 top-6 h-28 w-28 text-purple-200/60" />
          <div className="relative z-10 flex-1 flex items-center">
            <span className="font-serif italic text-5xl min-[360px]:text-6xl sm:text-7xl font-semibold drop-shadow">
              CyMon
            </span>
          </div>
          <p className="relative z-10 text-[10px] min-[360px]:text-xs text-purple-100/80 leading-relaxed">
            Serving Brgy. Banilad &amp; Brgy. Maryferns, Calauan City<br />
            Data Privacy Act of 2012, NPC Circular 2023-04<br />
            © 2026 ClearMind Psychological Services
          </p>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="p-6 min-[360px]:p-8 sm:p-10 flex flex-col gap-4 min-[360px]:gap-5"
        >
          <div>
            <h1 className="text-2xl min-[360px]:text-3xl font-bold text-purple-800">
              Welcome Back!
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Empowering every child&apos;s unique potential. Log in to access
              comprehensive developmental assessments, personalized early
              intervention plans, and dedicated support from our specialists.
            </p>
          </div>

          <SegmentedControl
            value={role}
            onChange={setRole}
            options={[
              { value: 'client', label: 'Client' },
              { value: 'psychologist', label: 'Clinician' },
              { value: 'psychometrician', label: 'RPm' },
              { value: 'admin', label: 'Admin' },
            ]}
          />

          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember Me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <a
              href="#forgot"
              className="text-sm font-medium text-purple-700 hover:text-purple-900"
            >
              Forgot Password?
            </a>
          </div>

          {!supabaseConfigured ? (
            <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Supabase not configured. Create <code>frontend/.env</code> from{' '}
              <code>.env.example</code> and restart the dev server.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'SIGNING IN…' : 'LOG IN'}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an Account?{' '}
            <button
              type="button"
              onClick={() => navigate('/setup/personal')}
              className="font-medium text-purple-700 hover:text-purple-900"
            >
              Register
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
