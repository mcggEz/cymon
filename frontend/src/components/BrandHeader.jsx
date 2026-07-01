function BrandHeader() {
  return (
    <div className="flex items-center justify-center gap-3 py-6 min-[360px]:py-8">
      <img
        src="/logo-cymon.png"
        alt="CyMon"
        className="h-11 w-11 rounded-xl object-cover min-[360px]:h-14 min-[360px]:w-14"
      />
      <div className="text-center">
        <div className="font-serif italic text-4xl font-bold text-charcoal min-[360px]:text-5xl">
          CyMon
        </div>
        <div className="mt-1 font-mono text-[9px] tracking-[0.2em] text-slate-400 min-[360px]:text-[10px]">
          CLEARMIND · PSYCHOLOGICAL SERVICES
        </div>
      </div>
    </div>
  )
}

export default BrandHeader
