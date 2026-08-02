import type { RecruiterJobCreateTranslations, RecruiterJobsTranslations } from '../../../i18n/types'
import type { RecruiterJobStatusCounts } from '../../../types/job.types'
import type { RecruiterJobsStatusFilter } from '../types'
import {
  getStatusFilterCount,
  STATUS_FILTERS,
} from '../utils/recruiterJobsData'

type RecruiterJobStatusTabsProps = {
  activeStatus: RecruiterJobsStatusFilter
  counts: RecruiterJobStatusCounts
  jobLabels: RecruiterJobCreateTranslations['statusLabels']
  onChange: (status: RecruiterJobsStatusFilter) => void
  translations: RecruiterJobsTranslations
}

export function RecruiterJobStatusTabs({
  activeStatus,
  counts,
  jobLabels,
  onChange,
  translations,
}: RecruiterJobStatusTabsProps) {
  return (
    <div aria-label={translations.filters.statusLabel} className="recruiter-job-status-tabs" role="tablist">
      {STATUS_FILTERS.map((status) => {
        const isActive = status === activeStatus
        const label = status === 'ALL' ? translations.filters.allStatus : jobLabels[status]

        return (
          <button
            aria-selected={isActive}
            className={isActive ? 'is-active' : undefined}
            key={status}
            onClick={() => onChange(status)}
            role="tab"
            type="button"
          >
            <span>{label}</span>
            <strong>{getStatusFilterCount(counts, status)}</strong>
          </button>
        )
      })}
    </div>
  )
}
