const CheckIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
    <path
      d="M5 10.5l3 3 7-7"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function StepProgress({ current, steps }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-purple-600">
        PROFILE SETUP · STEP {current} OF {steps.length}
      </div>
      <div className="mt-4 flex items-center">
        {steps.map((label, i) => {
          const n = i + 1
          const done = n < current
          const active = n === current
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition',
                    done
                      ? 'bg-purple-700 text-white'
                      : active
                        ? 'bg-purple-700 text-white ring-4 ring-purple-200'
                        : 'border border-slate-200 bg-slate-50 text-slate-400',
                  ].join(' ')}
                >
                  {done ? <CheckIcon /> : n}
                </div>
                <div
                  className={[
                    'mt-1.5 text-[10px] font-medium sm:text-xs',
                    active || done ? 'text-slate-900' : 'text-slate-400',
                  ].join(' ')}
                >
                  {label}
                </div>
              </div>
              {n < steps.length ? (
                <div
                  className={[
                    'mx-2 h-px flex-1',
                    done ? 'bg-purple-700' : 'bg-slate-200',
                  ].join(' ')}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepProgress
