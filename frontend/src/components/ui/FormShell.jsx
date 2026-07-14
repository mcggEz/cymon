import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Full-screen document shell for the CMPS forms. The paper is a Long Bond paper sheet (8.5in x 13in)
// that uses the official CMPS letterhead image (public/cmps-letterhead.png) as a
// full-bleed background — the dual-office header, purple wave art, and footer
// tagline all come from that asset — with the form's code, title, and body laid
// into the white writing area. The SAME markup prints; the print stylesheet
// hides the app and toolbar and forces exact colors so the letterhead renders
// into the PDF. Clicking the gray canvas (or Esc / Close) dismisses it.
function FormShell({
  title,
  subtitle,
  code,
  confidential = true,
  onReset,
  onClose,
  actions,
  multiPage = false,
  children,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Automatically expand textareas on print, and restore original height on finish
  useEffect(() => {
    let savedHeights = []
    const handleBeforePrint = () => {
      savedHeights = []
      document.querySelectorAll('textarea').forEach((ta) => {
        savedHeights.push({ el: ta, height: ta.style.height })
        ta.style.height = 'auto'
        ta.style.height = `${ta.scrollHeight + 4}px`
      })
    }
    const handleAfterPrint = () => {
      savedHeights.forEach(({ el, height }) => {
        if (el) el.style.height = height
      })
      savedHeights = []
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  const pages = multiPage
    ? Array.isArray(children)
      ? children.filter(Boolean)
      : [children]
    : null

  return createPortal(
    <div
      id="form-portal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/60 backdrop-blur-sm print:static print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <style>{`
        @media print {
          #root { display: none !important; }
          #form-portal { position: static !important; background: #fff !important; }
          #form-portal * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0 !important; }
          .print-page-break { page-break-after: always; break-after: page; }
          .print-page-break:last-child { page-break-after: avoid; break-after: avoid; }
          
          /* Hide scrollbars on print */
          ::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; }
          .overflow-x-auto, .overflow-y-auto { overflow: visible !important; }
          
          /* Force tables to fit printable sheet width without horizontal overflow */
          #form-portal table {
            min-width: 0 !important;
            width: 100% !important;
            table-layout: auto !important;
          }
        }
      `}</style>

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
        className="flex-1 overflow-y-auto bg-slate-500/30 p-4 sm:p-8 print:overflow-visible print:bg-white print:p-0 flex flex-col gap-6 items-center print:gap-0 print:block"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {multiPage ? (
          pages.map((pageContent, idx) => {
            const isFirst = idx === 0
            return (
              <article
                key={idx}
                className="print-page-break relative aspect-[17/22] w-full max-w-[816px] bg-white px-[9.5%] pb-[8.5%] pt-[13%] text-[12px] sm:text-[11.5px] leading-snug text-slate-900 shadow-xl ring-1 ring-black/5 print:max-w-none print:shadow-none print:ring-0"
                style={{
                  backgroundImage: 'url(/cmps-letterhead.png)',
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'top center',
                }}
              >
                {isFirst ? (
                  <>
                    {code ? <div className="text-right text-[10px] font-bold text-purple-700">{code}</div> : null}
                    <div className="text-center">
                      <h1 className="text-base font-bold uppercase tracking-wide text-purple-800">{title}</h1>
                      {subtitle ? (
                        <div className="text-[13px] font-bold uppercase tracking-wide text-purple-800">{subtitle}</div>
                      ) : null}
                      {confidential ? <div className="text-[11px] font-bold text-purple-700">(Highly Confidential)</div> : null}
                    </div>
                    <div className="mt-2">{pageContent}</div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between border-b border-purple-200 pb-1 mb-3 text-[10px] text-purple-600 font-semibold tracking-wide print:mt-4">
                      <span>{title} {subtitle ? ` - ${subtitle}` : ''}</span>
                      <span>Page {idx + 1}</span>
                    </div>
                    <div className="mt-2">{pageContent}</div>
                  </>
                )}
              </article>
            )
          })
        ) : (
          <article
            className="relative aspect-[17/22] w-full max-w-[816px] bg-white px-[9.5%] pb-[8.5%] pt-[13%] text-[12px] sm:text-[11.5px] leading-snug text-slate-900 shadow-xl ring-1 ring-black/5 print:max-w-none print:shadow-none print:ring-0"
            style={{
              backgroundImage: 'url(/cmps-letterhead.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top center',
            }}
          >
            {code ? <div className="text-right text-[10px] font-bold text-purple-700">{code}</div> : null}
            <div className="text-center">
              <h1 className="text-base font-bold uppercase tracking-wide text-purple-800">{title}</h1>
              {subtitle ? (
                <div className="text-[13px] font-bold uppercase tracking-wide text-purple-800">{subtitle}</div>
              ) : null}
              {confidential ? <div className="text-[11px] font-bold text-purple-700">(Highly Confidential)</div> : null}
            </div>
            <div className="mt-2">{children}</div>
          </article>
        )}

        {actions ? (
          <div className="sticky bottom-4 z-20 mx-auto w-full max-w-[816px] rounded-xl border border-purple-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm print:hidden">
            {actions}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

export default FormShell
