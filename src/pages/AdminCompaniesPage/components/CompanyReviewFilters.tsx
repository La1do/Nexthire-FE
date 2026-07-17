import type { ChangeEvent } from 'react'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
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

  function handleStatusChange(value: string) {
    onStatusChange(value as CompanyReviewStatus | 'all')
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

      <SelectField
        className="admin-filter admin-filter--select"
        label={content.statusLabel}
        onChange={handleStatusChange}
        options={[
          { label: content.statusAll, value: 'all' },
          { label: statusesLabel.pending, value: 'pending' },
          { label: statusesLabel.approved, value: 'approved' },
          { label: statusesLabel.rejected, value: 'rejected' },
        ]}
        value={status}
      />

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
