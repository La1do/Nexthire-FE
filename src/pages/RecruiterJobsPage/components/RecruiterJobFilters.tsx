import { Search, RotateCcw } from 'lucide-react'
import { SelectField } from '../../_components'
import type { RecruiterJobsTranslations } from '../../../i18n/types'
import type { RecruiterJobsFilters } from '../types'
import { JOB_SORT_OPTIONS } from '../utils/recruiterJobsData'

type RecruiterJobFiltersProps = {
  filters: RecruiterJobsFilters
  onApplySearch: (value: string) => void
  onClear: () => void
  onSearchInputChange: (value: string) => void
  onSortChange: (value: RecruiterJobsFilters['sort']) => void
  searchInput: string
  translations: RecruiterJobsTranslations
}

export function RecruiterJobFilters({
  filters,
  onApplySearch,
  onClear,
  onSearchInputChange,
  onSortChange,
  searchInput,
  translations,
}: RecruiterJobFiltersProps) {
  const sortOptions = JOB_SORT_OPTIONS.map((value) => ({
    label: translations.sortOptions[value],
    value,
  }))

  const hasActiveFilters = Boolean(searchInput.trim() || filters.sort !== 'latest')

  return (
    <form
      className="admin-users-filters recruiter-job-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApplySearch(searchInput)
      }}
    >
      <div className="admin-filter admin-filter--query">
        <span className="admin-filter__label">{translations.filters.searchLabel}</span>
        <div className="admin-moderation-search-control">
          <span aria-hidden="true" className="admin-filter__icon">
            <Search size={16} />
          </span>
          <input
            className="admin-filter__input"
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder={translations.filters.searchPlaceholder}
            type="search"
            value={searchInput}
          />
        </div>
      </div>
      <SelectField
        className="admin-filter admin-filter--select recruiter-job-filter-select"
        label={translations.filters.sortLabel}
        menuClassName="admin-filter-menu"
        onChange={(value) => onSortChange(value as RecruiterJobsFilters['sort'])}
        options={sortOptions}
        value={filters.sort}
      />
      <div className="admin-filter-actions">
        <button className="admin-filter__apply" type="submit">
          {translations.filters.apply}
        </button>
        {hasActiveFilters ? (
          <button
            className="admin-filter__clear"
            onClick={onClear}
            type="button"
          >
            <RotateCcw size={14} />
            <span>{translations.filters.clear}</span>
          </button>
        ) : null}
      </div>
    </form>
  )
}
