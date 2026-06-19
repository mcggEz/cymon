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
    <div className="flex items-center justify-center gap-3 py-6 min-[360px]:py-8">
      <Butterfly className="h-9 w-9 text-violet min-[360px]:h-11 min-[360px]:w-11" />
      <div className="text-center">
        <div className="font-serif italic text-4xl font-bold text-charcoal min-[360px]:text-5xl">
          CyMon
        </div>
        <div className="mt-1 font-mono text-[9px] tracking-[0.2em] text-slate-400 min-[360px]:text-[10px]">
          CLEARMIND · PSYCHOLOGICAL SERVICES
        </div>
      </div>
      <Butterfly className="h-9 w-9 text-violet min-[360px]:h-11 min-[360px]:w-11" flip />
    </div>
  )
}

export default BrandHeader
