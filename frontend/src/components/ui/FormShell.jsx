import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const CABUYAO = [
  'Blk 1 Lot 7 Palmsville Subdivision',
  'Brgy. Banlic, Cabuyao City, Laguna 4025',
  'cabuyaoadmin@clearmindpsychservices.com',
  '(+639)92-916-4078',
]
const ALABANG = [
  'Unit 4-M, Westgate Tower, Madrigal Business',
  'Park, 1709 Investment Dr, Barangay Ayala',
  'Alabang, Muntinlupa City, Philippines, 1780',
  'alabangadmin@clearmindpsychservices.com',
  '(+639)70-885-8948',
]

// Full-screen document shell that reproduces the printed CMPS form template:
// a dual-office letterhead (Cabuyao / ClearMind wordmark / Alabang), a bordered
// content frame carrying the form code + title, and the "Clarity of Mind,
// Journey to Wellness." footer, over faint purple wave decoration. The SAME
// markup prints — the print stylesheet hides the app and the viewer toolbar and
// forces exact colors so the letterhead and frame render into the PDF.
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
      <style>{`@media print{#root{display:none!important}#form-portal{position:static!important;background:#fff!important}#form-portal *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}@page{size:A4;margin:10mm}}`}</style>

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
        <article className="relative mx-auto w-full max-w-[850px] overflow-hidden bg-white px-7 pb-4 pt-6 shadow-xl ring-1 ring-black/5 sm:px-10 print:max-w-none print:shadow-none print:ring-0">
          {/* faint purple wave decoration (approximation of the printed template) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{ background: 'radial-gradient(120% 80% at 50% -20%, rgba(124,58,237,0.10), transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
            style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(124,58,237,0.14), transparent 70%)' }}
          />

          {/* Letterhead */}
          <header className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center text-[9px] leading-tight text-purple-800">
              <div className="text-[11px] font-bold tracking-wide">CABUYAO</div>
              {CABUYAO.map((l) => (
                <div key={l} className="font-semibold">{l}</div>
              ))}
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl font-semibold leading-none text-purple-800">ClearMind</div>
              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-purple-500">
                Psychological Services
              </div>
            </div>
            <div className="text-center text-[9px] leading-tight text-purple-800">
              <div className="text-[11px] font-bold tracking-wide">ALABANG</div>
              {ALABANG.map((l) => (
                <div key={l} className="font-semibold">{l}</div>
              ))}
            </div>
          </header>

          {/* Bordered content frame */}
          <div className="relative mt-3 border-[1.5px] border-slate-900 px-6 py-4">
            {code ? (
              <div className="text-right text-[11px] font-bold text-purple-700">{code}</div>
            ) : null}
            <div className="text-center">
              <h1 className="text-lg font-bold uppercase tracking-wide text-purple-800">{title}</h1>
              {subtitle ? (
                <div className="text-sm font-bold uppercase tracking-wide text-purple-800">{subtitle}</div>
              ) : null}
              {confidential ? (
                <div className="text-xs font-bold text-purple-700">(Highly Confidential)</div>
              ) : null}
            </div>
            <div className="mt-3">{children}</div>
          </div>

          {/* Footer tagline */}
          <div className="relative mt-2 text-center font-serif text-sm italic text-purple-700">
            Clarity of Mind, Journey to Wellness.
          </div>
        </article>

        {actions ? (
          <div className="mx-auto mt-4 w-full max-w-[850px] print:hidden">{actions}</div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

export default FormShell
