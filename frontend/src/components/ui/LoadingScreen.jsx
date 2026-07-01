// Full-screen branded loader — a spinning ring around the CyMon logo. Used for
// the auth check and while signing in on slow connections.
function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#efeaf7] text-purple-700">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        <img
          src="/logo-cymon.png"
          alt="CyMon"
          className="absolute inset-2 h-16 w-16 rounded-full object-cover shadow-sm"
        />
      </div>
      <div className="text-sm font-medium tracking-wide text-purple-700/80">{label}</div>
    </div>
  )
}

export default LoadingScreen
