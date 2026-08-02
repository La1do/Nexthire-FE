import { Button, Input, SelectField } from '../../_components'
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

  return (
    <form
      className="recruiter-job-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApplySearch(searchInput)
      }}
    >
      <Input
        label={translations.filters.searchLabel}
        onChange={(event) => onSearchInputChange(event.target.value)}
        placeholder={translations.filters.searchPlaceholder}
        type="search"
        value={searchInput}
      />
      <SelectField
        className="recruiter-job-filter-select"
        label={translations.filters.sortLabel}
        onChange={(value) => onSortChange(value as RecruiterJobsFilters['sort'])}
        options={sortOptions}
        value={filters.sort}
      />
      <div className="recruiter-job-filters__actions">
        <Button type="submit">{translations.filters.apply}</Button>
        <Button onClick={onClear} type="button" variant="secondary">
          {translations.filters.clear}
        </Button>
      </div>
    </form>
  )
}
