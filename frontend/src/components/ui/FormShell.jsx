import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const CLINIC = {
  name: 'ClearMind Psychological Services',
  tagline: 'Clarity of Mind, Journey to Wellness.',
  addr1: 'Blk 1 Lot 7 Palmsville Subdivision',
  addr2: 'Brgy. Banlic, Cabuyao City, Laguna 4025',
  contact: 'clearmind.psychservices@gmail.com · (+639)92-916-4078',
}

// Full-screen document shell for a clinic form: a dark viewer toolbar (hidden in
// print) over a white A4 "paper" holding the shared ClearMind letterhead, title,
// and the form body. The SAME markup is what prints — "Print / Save as PDF" runs
// window.print(), and the print stylesheet hides the app and toolbar so only the
// paper prints. Portaled to <body> so print isolation works regardless of nesting.
function FormShell({ title, subtitle, code, confidential = true, onReset, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      id="form-portal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 print:static print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <style>{`@media print{#root{display:none!important}#form-portal{position:static!important;background:#fff!important}@page{size:A4;margin:14mm}}`}</style>

      <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 text-white print:hidden">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          {code ? <div className="truncate text-xs text-slate-400">Form {code}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onReset ? (
            <button
              onClick={onReset}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Reset
            </button>
          ) : null}
          <button
            onClick={() => window.print()}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-500/30 p-4 sm:p-8 print:overflow-visible print:bg-white print:p-0">
        <article className="mx-auto w-full max-w-[900px] bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-10 print:max-w-none print:p-0 print:shadow-none print:ring-0">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-purple-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-purple-400 font-serif text-lg font-semibold text-white">
                CM
              </div>
              <div>
                <div className="font-serif text-lg font-semibold text-purple-900">{CLINIC.name}</div>
                <div className="text-[11px] italic text-purple-400">{CLINIC.tagline}</div>
              </div>
            </div>
            <div className="text-right text-[11px] leading-relaxed text-slate-500">
              {CLINIC.addr1}
              <br />
              {CLINIC.addr2}
              <br />
              {CLINIC.contact}
              {code ? (
                <>
                  <br />
                  <span className="font-mono text-[10px] text-purple-400">{code}</span>
                </>
              ) : null}
            </div>
          </header>

          <div className="mt-4 text-center">
            <h1 className="font-serif text-2xl font-semibold text-purple-900">{title}</h1>
            {subtitle ? <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div> : null}
            {confidential ? (
              <div className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-rose-600">
                Highly Confidential
              </div>
            ) : null}
          </div>

          <div className="mt-6">{children}</div>
        </article>
      </div>
    </div>,
    document.body
  )
}

export default FormShell
