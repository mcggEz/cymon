// Floating dialog: dim backdrop with a centered card whose frame stays fixed on
// screen (capped height) while only the body scrolls. Header and optional footer
// stay pinned. Pass action buttons via `footer` so they don't scroll with content.
function Modal({ title, subtitle, onClose, children, footer, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-4 sm:p-8">
      <div
        className={`relative flex max-h-[calc(100vh-4rem)] w-full ${maxWidth} flex-col rounded-2xl border border-purple-200 bg-white shadow-[0_30px_80px_-20px_rgba(88,28,135,0.45)]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <div className="text-lg font-bold text-purple-800">{title}</div>
            {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-2xl leading-none text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}

export default Modal
