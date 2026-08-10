import type { ChangeEvent } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type {
  RecruiterApplicationJobOption,
  RecruiterApplicationSort,
  RecruiterApplicationStatus,
} from '../types'

type ApplicationFiltersProps = {
  content: RecruiterApplicationsTranslations['filters']
  hasActiveFilters: boolean
  jobId: string | 'all'
  jobs: ReadonlyArray<RecruiterApplicationJobOption>
  onClear: () => void
  onJobChange: (value: string | 'all') => void
  onQueryChange: (value: string) => void
  onSortChange: (value: RecruiterApplicationSort) => void
  onStatusChange: (value: RecruiterApplicationStatus | 'all') => void
  query: string
  sort: RecruiterApplicationSort
  status: RecruiterApplicationStatus | 'all'
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
  tabs: RecruiterApplicationsTranslations['tabs']
}

const statusOrder: ReadonlyArray<RecruiterApplicationStatus> = [
  'SUBMITTED',
  'OFFERED',
  'REJECTED',
  'CANCELLED',
]

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function ApplicationFilters({
  content,
  hasActiveFilters,
  jobId,
  jobs,
  onClear,
  onJobChange,
  onQueryChange,
  onSortChange,
  onStatusChange,
  query,
  sort,
  status,
  statusLabels,
  tabs,
}: ApplicationFiltersProps) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
  }

  function handleSortChange(value: string) {
    onSortChange(value as RecruiterApplicationSort)
  }

  return (
    <section className="recruiter-applications-filters" aria-label={content.queryLabel}>
      <div className="recruiter-applications-tabs" aria-label={tabs.label} role="tablist">
        <button
          aria-selected={status === 'all'}
          className={status === 'all' ? 'is-active' : undefined}
          onClick={() => onStatusChange('all')}
          role="tab"
          type="button"
        >
          {tabs.all}
        </button>
        {statusOrder.map((item) => (
          <button
            aria-selected={status === item}
            className={status === item ? 'is-active' : undefined}
            key={item}
            onClick={() => onStatusChange(item)}
            role="tab"
            type="button"
          >
            {statusLabels[item]}
          </button>
        ))}
      </div>

      <form
        className="recruiter-applications-filter-grid"
        onSubmit={(event) => event.preventDefault()}
        role="search"
      >
        <label className="recruiter-applications-filter recruiter-applications-filter--query">
          <span className="sr-only">{content.queryLabel}</span>
          <span aria-hidden="true" className="recruiter-applications-filter__icon">
            <SearchIcon />
          </span>
          <input
            aria-label={content.queryLabel}
            className="recruiter-applications-filter__input"
            onChange={handleQueryChange}
            placeholder={content.queryPlaceholder}
            type="search"
            value={query}
          />
        </label>

        <SelectField
          className="recruiter-applications-filter recruiter-applications-filter--select"
          label={content.jobLabel}
          onChange={onJobChange}
          options={[
            { label: content.jobAll, value: 'all' },
            ...jobs.map((job) => ({ label: job.title, value: job.id })),
          ]}
          value={jobId}
        />

        <SelectField
          className="recruiter-applications-filter recruiter-applications-filter--select"
          label={content.sortLabel}
          onChange={handleSortChange}
          options={[
            { label: content.sortOptions.newest, value: 'newest' },
            { label: content.sortOptions.scoreDesc, value: 'score-desc' },
            { label: content.sortOptions.scoreAsc, value: 'score-asc' },
          ]}
          value={sort}
        />

        <button
          aria-label={content.clear}
          className="recruiter-applications-filter__clear"
          disabled={!hasActiveFilters}
          onClick={onClear}
          type="button"
        >
          {content.clear}
        </button>
      </form>
    </section>
  )
}
