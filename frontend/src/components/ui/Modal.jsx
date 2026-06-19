// Floating dialog: dim backdrop, centered scrollable card above the page.
function Modal({ title, subtitle, onClose, children, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-purple-950/50 p-4 sm:p-8">
      <div
        className={`relative my-4 w-full ${maxWidth} rounded-2xl border border-purple-200 bg-white shadow-[0_30px_80px_-20px_rgba(88,28,135,0.45)]`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
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
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
