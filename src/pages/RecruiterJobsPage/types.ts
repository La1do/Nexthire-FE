import type { RecruiterJobSortOption } from '../../i18n/types'
import type { JobStatus } from '../../types/job.types'

export type RecruiterJobsStatusFilter = JobStatus | 'ALL'

export type RecruiterJobAction = 'submit' | 'delete' | 'unpublish' | 'republish' | 'close'

export type RecruiterJobActionState = {
  action: RecruiterJobAction
  jobId: string
} | null

export type RecruiterJobsFilters = {
  limit: number
  page: number
  q: string
  sort: RecruiterJobSortOption
  status: RecruiterJobsStatusFilter
}
