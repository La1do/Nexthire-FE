import type { JobStatus } from '../../../types/job.types'
import { getStatusTone } from '../utils/recruiterJobsData'

type RecruiterJobStatusBadgeProps = {
  label: string
  status: JobStatus
}

export function RecruiterJobStatusBadge({ label, status }: RecruiterJobStatusBadgeProps) {
  return (
    <span className={`recruiter-job-status recruiter-job-status--${getStatusTone(status)}`}>
      {label}
    </span>
  )
}
