import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LoadingScreen from '../components/ui/LoadingScreen'
import { api } from '../lib/api'

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

const CheckIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function ResetPassword() {
  const navigate = useNavigate()
  const [accessToken] = useState(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      return params.get('access_token') || null
    }
    return null
  })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const token = params.get('access_token')
      if (!token) {
        return 'No access token found. The link may have expired or is invalid.'
      }
      return null
    } else {
      return 'Invalid reset link. Access token is missing.'
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accessToken) {
      setError('Missing token. Please request a new password reset link.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await api.resetPassword(accessToken, password)
      setSuccess(true)
      // Clear hash so page doesn't re-run effect with same token
      window.history.replaceState(null, null, ' ')
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {submitting ? <LoadingScreen label="Updating password…" /> : null}
      <main
        className="relative min-h-screen overflow-hidden text-charcoal flex flex-col items-center justify-center p-4"
        style={{ background: 'radial-gradient(circle at 50% 20%, #ede9fe 0%, #d8ccf7 45%, #c4b5fd 100%)' }}
      >
        {/* Back to Login Button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white px-3 py-1.5 text-sm font-semibold text-charcoal/70 transition-all hover:border-violet hover:text-violet shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[42rem] w-[75rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(221,128,188,0.12) 45%, transparent 70%)' }}
        />

        <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white p-8 sm:p-10 shadow-[0_30px_80px_-25px_rgba(124,58,237,0.35)] ring-1 ring-violet/10 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-cymon.png" alt="CyMon" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            <div className="leading-tight text-left">
              <div className="text-sm font-bold text-charcoal">CyMon</div>
              <div className="font-mono text-[7px] tracking-[0.2em] text-slate-400">CLEARMIND · PSYCHOLOGICAL SERVICES</div>
            </div>
          </div>

          {success ? (
            <div className="flex flex-col gap-5 items-center text-center py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal">Password Reset Complete</h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Your password has been successfully updated. You can now log in using your new credentials.
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                fullWidth
                size="lg"
                className="bg-violet hover:bg-violet-dark text-white font-sans tracking-wide text-base py-3 rounded-full mt-2 font-bold shadow-sm cursor-pointer"
              >
                Log In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-charcoal">Reset your password</h1>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Please enter and confirm your new account password below.
                </p>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 font-medium leading-normal"
                >
                  {error}
                </div>
              ) : null}

              {accessToken ? (
                <>
                  <Input
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={submitting}
                    className="bg-violet hover:bg-violet-dark text-white font-sans tracking-wide text-base py-3 rounded-full mt-2 font-bold shadow-sm cursor-pointer transition-all duration-200"
                  >
                    Update Password
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  size="lg"
                  className="bg-slate-200 hover:bg-slate-300 text-charcoal font-sans tracking-wide text-base py-3 rounded-full font-bold cursor-pointer"
                >
                  Go to Login
                </Button>
              )}
            </form>
          )}
        </section>
      </main>
    </>
  )
}

export default ResetPassword
