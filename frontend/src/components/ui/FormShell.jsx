import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Full-screen document shell for the CMPS forms. The paper is a US-Letter sheet
// that uses the official CMPS letterhead image (public/cmps-letterhead.png) as a
// full-bleed background — the dual-office header, purple wave art, and footer
// tagline all come from that asset — with the form's code, title, and body laid
// into the white writing area. The SAME markup prints; the print stylesheet
// hides the app and toolbar and forces exact colors so the letterhead renders
// into the PDF. Clicking the gray canvas (or Esc / Close) dismisses it.
function FormShell({ title, subtitle, code, confidential = true, onReset, onClose, actions, children }) {
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
      <style>{`@media print{#root{display:none!important}#form-portal{position:static!important;background:#fff!important}#form-portal *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{size:letter;margin:0}}`}</style>

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

      <div
        className="flex-1 overflow-y-auto bg-slate-500/30 p-4 sm:p-8 print:overflow-visible print:bg-white print:p-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <article
          className="relative mx-auto aspect-[4830/6250] w-full max-w-[816px] bg-white px-[11%] pb-[10%] pt-[12%] shadow-xl ring-1 ring-black/5 print:max-w-none print:shadow-none print:ring-0"
          style={{
            backgroundImage: 'url(/cmps-letterhead.png)',
            backgroundSize: '100% auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
          }}
        >
          {code ? <div className="text-right text-[11px] font-bold text-purple-700">{code}</div> : null}
          <div className="text-center">
            <h1 className="text-lg font-bold uppercase tracking-wide text-purple-800">{title}</h1>
            {subtitle ? (
              <div className="text-sm font-bold uppercase tracking-wide text-purple-800">{subtitle}</div>
            ) : null}
            {confidential ? <div className="text-xs font-bold text-purple-700">(Highly Confidential)</div> : null}
          </div>
          <div className="mt-3">{children}</div>
        </article>

        {actions ? (
          <div className="mx-auto mt-4 w-full max-w-[816px] print:hidden">{actions}</div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

export default FormShell
