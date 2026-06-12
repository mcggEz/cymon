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

function BrandHeader() {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <Butterfly className="h-12 w-12 text-purple-700" />
      <div className="relative">
        <div className="font-serif italic text-4xl font-semibold text-white drop-shadow-md bg-gradient-to-r from-purple-700 to-purple-900 px-8 py-2 rounded-md">
          CyMon
        </div>
        <div className="mt-1 text-center text-[10px] tracking-[0.25em] text-purple-700/80">
          CLEARMIND · PSYCHOLOGICAL SERVICES
        </div>
      </div>
      <Butterfly className="h-12 w-12 text-purple-700" flip />
    </div>
  )
}

export default BrandHeader
