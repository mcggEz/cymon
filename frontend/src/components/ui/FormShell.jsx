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
        @media screen {
          .form-article {
            position: relative;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px rgba(56,34,79,0.04);
            border: 1px solid #f3e8ff;
            border-radius: 1rem;
            padding: 2rem !important;
            max-width: 900px;
            width: 100%;
            font-size: 14.5px !important;
            line-height: 1.6 !important;
            color: #1e1b4b !important;
            margin-bottom: 0.5rem;
          }
          .form-article-page-header {
            display: flex !important;
            justify-content: space-between;
            border-bottom: 2px solid #f3e8ff;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            font-size: 12px !important;
            font-weight: 600;
            color: #8b5cf6;
          }
        }

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

          /* Force exact print-page aspect ratio and letterhead background */
          .form-article {
            position: relative !important;
            aspect-ratio: 17/22 !important;
            width: 100% !important;
            max-width: none !important;
            background-image: url(/cmps-letterhead.png) !important;
            background-size: 100% 100% !important;
            background-repeat: no-repeat !important;
            background-position: top center !important;
            padding-left: 9.5% !important;
            padding-right: 9.5% !important;
            padding-bottom: 8.5% !important;
            padding-top: 13% !important;
            font-size: 11.5px !important;
            line-height: 1.35 !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin-bottom: 0 !important;
          }
          
          .form-article-page-header {
            display: flex !important;
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
        className="flex-1 overflow-y-auto bg-[#F5F1FA] p-4 sm:p-6 print:overflow-visible print:bg-white print:p-0 flex flex-col items-center print:block"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="w-full max-w-[900px] flex flex-col gap-6 print:block print:max-w-none print:gap-0">
          {/* Screen-only Brand Header */}
          <header className="w-full mb-2 flex justify-between items-start border-b border-purple-200 pb-4 flex-wrap gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-800 to-purple-500 flex items-center justify-center text-white font-serif font-semibold text-lg shrink-0">
                CM
              </div>
              <div>
                <div className="font-serif font-bold text-base text-purple-950 leading-tight">ClearMind Psychological Services</div>
                <div className="text-[11px] text-purple-600 italic">Clarity of Mind, Journey to Wellness.</div>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 leading-normal font-medium">
              <div>Blk 1 Lot 7 Palmsville Subdivision</div>
              <div>Brgy. Banlic, Cabuyao City, Laguna 4025</div>
              <div>clearmind.psychservices@gmail.com · (+639)92-916-4078</div>
              {code && <div className="font-mono text-purple-700 font-bold mt-1 text-[10px]">{code}</div>}
            </div>
          </header>

          {multiPage ? (
            pages.map((pageContent, idx) => {
              const isFirst = idx === 0
              return (
                <article key={idx} className="form-article print-page-break">
                  <img
                    src="/cmps-letterhead.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill hidden print:block pointer-events-none select-none"
                    style={{ zIndex: -1 }}
                    aria-hidden="true"
                  />
                  {isFirst ? (
                    <>
                      {code ? <div className="text-right text-[10px] font-bold text-purple-700 print:block hidden">{code}</div> : null}
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
                      <div className="form-article-page-header">
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
            <article className="form-article">
              <img
                src="/cmps-letterhead.png"
                alt=""
                className="absolute inset-0 w-full h-full object-fill hidden print:block pointer-events-none select-none"
                style={{ zIndex: -1 }}
                aria-hidden="true"
              />
              {code ? <div className="text-right text-[10px] font-bold text-purple-700 print:block hidden">{code}</div> : null}
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
            <div className="sticky bottom-4 z-20 mx-auto w-full max-w-[900px] rounded-xl border border-purple-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm print:hidden">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default FormShell
