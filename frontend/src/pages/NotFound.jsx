import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#efeaf7] px-6 text-center">
      <img src="/logo-cymon.png" alt="CyMon" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
      <div className="text-7xl font-bold tracking-tight text-purple-800">404</div>
      <div>
        <h1 className="text-xl font-bold text-purple-800">Page not found</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-purple-300 px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
        >
          Back to Home
        </button>
      </div>
    </main>
  )
}

export default NotFound
