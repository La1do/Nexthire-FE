import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateManagedJobFilter, CandidateManagedJobSort, CandidateManagedJobTabCounts } from '../types'

type CandidateJobsFiltersProps = {
  activeFilter: CandidateManagedJobFilter
  content: ProfileTranslations['managedJobs']
  onFilterChange: (filter: CandidateManagedJobFilter) => void
  onSearchChange: (query: string) => void
  onSortChange: (sort: CandidateManagedJobSort) => void
  searchQuery: string
  sort: CandidateManagedJobSort
  tabCounts: CandidateManagedJobTabCounts
}

const filterOptions: CandidateManagedJobFilter[] = ['all', 'saved', 'applied', 'active', 'closed']
const sortOptions: CandidateManagedJobSort[] = ['newest', 'deadline', 'salary']

export function CandidateJobsFilters({
  activeFilter,
  content,
  onFilterChange,
  onSearchChange,
  onSortChange,
  searchQuery,
  sort,
  tabCounts,
}: CandidateJobsFiltersProps) {
  return (
    <section className="candidate-jobs-filters" aria-label={content.filters.label}>
      <label className="candidate-jobs-search">
        <span>{content.filters.searchLabel}</span>
        <input
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder={content.filters.searchPlaceholder}
          type="search"
          value={searchQuery}
        />
      </label>

      <fieldset className="candidate-jobs-tabs">
        <legend>{content.filters.tabLabel}</legend>
        <div>
          {filterOptions.map((option) => {
            const isActive = option === activeFilter

            return (
              <button
                aria-pressed={isActive}
                className={isActive ? 'is-active' : undefined}
                key={option}
                onClick={() => onFilterChange(option)}
                type="button"
              >
                <span>{content.filters.tabs[option]}</span>
                <strong>{tabCounts[option]}</strong>
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="candidate-jobs-sort">
        <span>{content.filters.sortLabel}</span>
        <select
          onChange={(event) => onSortChange(event.currentTarget.value as CandidateManagedJobSort)}
          value={sort}
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {content.filters.sortOptions[option]}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
