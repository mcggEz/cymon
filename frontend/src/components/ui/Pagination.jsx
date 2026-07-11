// Simple page-based pagination footer for the dashboard tables. Renders nothing
// when everything fits on one page. Parent owns `page` state and slices its rows.
function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const btn =
    'rounded-md border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="text-xs text-slate-500">
        Showing {start}–{end} of {total}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className={btn}>
          Prev
        </button>
        <span className="text-sm text-slate-600">
          Page {page} of {pages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages} className={btn}>
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
