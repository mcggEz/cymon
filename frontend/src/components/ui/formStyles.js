// Shared Tailwind class strings for the clinic form primitives so every
// translated form (FO-01…FO-13) styles its inputs identically.
export const fieldInput =
  'w-full rounded-md border border-purple-200 bg-purple-50/40 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200'

export const fieldTextarea = `${fieldInput} min-h-[70px] resize-y`

export const fieldReadonly =
  'w-full rounded-md border border-purple-200 bg-purple-100/60 px-3 py-2 text-sm text-slate-500'
