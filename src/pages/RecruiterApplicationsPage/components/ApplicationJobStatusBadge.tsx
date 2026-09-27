import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { ApplicationJobStatus } from '../types'
import './application-job-status-badge.css'

type ApplicationJobStatusBadgeProps = {
  labels: RecruiterApplicationsTranslations['jobStatusLabels']
  status: ApplicationJobStatus
}

export function ApplicationJobStatusBadge({ labels, status }: ApplicationJobStatusBadgeProps) {
  return (
    <span className={`recruiter-application-job-status recruiter-application-job-status--${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  )
}
