// Shared Tailwind class strings for the clinic form primitives so every
// translated form (FO-01…FO-13) styles its inputs identically.
// Sizes are tuned so a form reads like the printed CMPS PDF on a US-Letter sheet:
// 12.5px body, compact vertical padding, so sections fit the page instead of
// overflowing past the letterhead.
export const fieldInput =
  'w-full rounded-md border border-purple-200 bg-purple-50/40 px-2.5 py-1.5 text-[12px] sm:text-[11.5px] leading-snug text-slate-800 placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200'

export const fieldTextarea = `${fieldInput} min-h-[52px] resize-y`

export const fieldReadonly =
  'w-full rounded-md border border-purple-200 bg-purple-100/60 px-2.5 py-1.5 text-[12px] sm:text-[11.5px] leading-snug text-slate-500'

// Paper-form "write on the line" input: transparent with only a bottom rule,
// matching the printed CMPS forms (label on the left, blank underline on the right).
export const blankInput =
  'w-full border-b border-slate-400 bg-transparent px-1 py-0 text-[12px] sm:text-[11.5px] leading-5 text-slate-900 focus:border-purple-600 focus:outline-none'

// A blank cell input for the score/observation tables (no border of its own; the
// table cell supplies the border).
export const cellInput =
  'w-full bg-transparent px-1.5 py-1 text-[12px] sm:text-[11.5px] text-slate-900 focus:bg-purple-50 focus:outline-none'
