import type { ChangeEvent } from 'react'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { CompanyReviewStatus } from '../types'

type CompanyReviewFiltersProps = {
  content: AdminCompaniesTranslations['filters']
  hasActiveFilters: boolean
  onClear: () => void
  onQueryChange: (value: string) => void
  onStatusChange: (value: CompanyReviewStatus | 'all') => void
  query: string
  status: CompanyReviewStatus | 'all'
  statusesLabel: AdminCompaniesTranslations['statuses']
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function CompanyReviewFilters({
  content,
  hasActiveFilters,
  onClear,
  onQueryChange,
  onStatusChange,
  query,
  status,
  statusesLabel,
}: CompanyReviewFiltersProps) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusChange(event.target.value as CompanyReviewStatus | 'all')
  }

  return (
    <form
      aria-label={content.queryLabel}
      className="admin-users-filters admin-companies-filters"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <label className="admin-filter admin-filter--query">
        <span className="sr-only">{content.queryLabel}</span>
        <span aria-hidden="true" className="admin-filter__icon">
          <SearchIcon />
        </span>
        <input
          aria-label={content.queryLabel}
          className="admin-filter__input"
          onChange={handleQueryChange}
          placeholder={content.queryPlaceholder}
          type="search"
          value={query}
        />
      </label>

      <label className="admin-filter">
        <span className="admin-filter__label">{content.statusLabel}</span>
        <select
          aria-label={content.statusLabel}
          className="admin-filter__select"
          onChange={handleStatusChange}
          value={status}
        >
          <option value="all">{content.statusAll}</option>
          <option value="pending">{statusesLabel.pending}</option>
          <option value="approved">{statusesLabel.approved}</option>
          <option value="rejected">{statusesLabel.rejected}</option>
        </select>
      </label>

      <button
        aria-label={content.clear}
        className="admin-filter__clear"
        disabled={!hasActiveFilters}
        onClick={onClear}
        type="button"
      >
        {content.clear}
      </button>
    </form>
  )
}
