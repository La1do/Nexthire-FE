import type { AdminUsersTranslations } from '../../../i18n/types'

type AdminPaginationProps = {
  labels: AdminUsersTranslations['pagination']
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}

function buildPageRange(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_value, index) => index + 1)
  }

  const range: Array<number | 'gap'> = [1]

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) {
    range.push('gap')
  }

  for (let current = start; current <= end; current += 1) {
    range.push(current)
  }

  if (end < totalPages - 1) {
    range.push('gap')
  }

  range.push(totalPages)
  return range
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function AdminPagination({ labels, onPageChange, page, totalPages }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const range = buildPageRange(page, totalPages)
  const isFirst = page <= 1
  const isLast = page >= totalPages
  const pageOfLabel = labels.pageOf
    .replace('{{current}}', String(page))
    .replace('{{total}}', String(totalPages))

  return (
    <nav aria-label={pageOfLabel} className="admin-pagination">
      <button
        aria-label={labels.prev}
        className="admin-pagination__step"
        disabled={isFirst}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        <ChevronLeftIcon />
      </button>

      <ol className="admin-pagination__list">
        {range.map((item, index) =>
          item === 'gap' ? (
            <li aria-hidden="true" className="admin-pagination__gap" key={`gap-${index}`}>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                aria-current={item === page ? 'page' : undefined}
                aria-label={pageOfLabel}
                className={`admin-pagination__page${item === page ? ' is-active' : ''}`}
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        aria-label={labels.next}
        className="admin-pagination__step"
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        <ChevronRightIcon />
      </button>

      <span aria-live="polite" className="admin-pagination__summary sr-only">
        {pageOfLabel}
      </span>
    </nav>
  )
}
