import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationFilter, CandidateApplication } from '../types'

const filterOptions: readonly ApplicationFilter[] = [
  'all',
  'SUBMITTED',
  'OFFERED',
  'REJECTED',
  'CANCELLED',
]

type ApplicationFiltersProps = {
  activeFilter: ApplicationFilter
  applications: ReadonlyArray<CandidateApplication>
  labels: ProfileTranslations['applications']['filters']
  onChange: (filter: ApplicationFilter) => void
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

function getFilterLabel(
  filter: ApplicationFilter,
  labels: ProfileTranslations['applications']['filters'],
  statusLabels: ProfileTranslations['applications']['statusLabels'],
) {
  return filter === 'all' ? labels.all : statusLabels[filter]
}

function getFilterCount(applications: ReadonlyArray<CandidateApplication>, filter: ApplicationFilter) {
  if (filter === 'all') {
    return applications.length
  }

  return applications.filter((application) => application.status === filter).length
}

export function ApplicationFilters({
  activeFilter,
  applications,
  labels,
  onChange,
  statusLabels,
}: ApplicationFiltersProps) {
  return (
    <div className="profile-application-filters" aria-label={labels.label} role="group">
      {filterOptions.map((filter) => {
        const isActive = activeFilter === filter

        return (
          <button
            aria-pressed={isActive}
            className={isActive ? 'profile-application-filter-active' : ''}
            key={filter}
            onClick={() => onChange(filter)}
            type="button"
          >
            <span>{getFilterLabel(filter, labels, statusLabels)}</span>
            <strong>{getFilterCount(applications, filter)}</strong>
          </button>
        )
      })}
    </div>
  )
}
