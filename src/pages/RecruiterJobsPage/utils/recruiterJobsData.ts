import type { RecruiterJobSortOption } from '../../../i18n/types'
import type {
  JobStatus,
  RecruiterJobResponse,
  RecruiterJobStatusCounts,
} from '../../../types/job.types'
import { formatDate, formatSalary, intlLocale } from '../../_utils/jobFormat'
import type { RecruiterJobAction, RecruiterJobsStatusFilter } from '../types'

export const JOB_STATUSES: ReadonlyArray<JobStatus> = [
  'DRAFT',
  'PENDING_REVIEW',
  'NEEDS_REVIEW',
  'SHOULD_REJECT',
  'PUBLISHED',
  'UNPUBLISHED',
  'REJECTED',
  'CLOSED',
  'EXPIRED',
]

export const STATUS_FILTERS: ReadonlyArray<RecruiterJobsStatusFilter> = ['ALL', ...JOB_STATUSES]

export const JOB_SORT_OPTIONS: ReadonlyArray<RecruiterJobSortOption> = [
  'latest',
  'deadline_asc',
  'salary_desc',
  'salary_asc',
]

export const DEFAULT_RECRUITER_JOB_COUNTS: RecruiterJobStatusCounts = {
  DRAFT: 0,
  PENDING_REVIEW: 0,
  NEEDS_REVIEW: 0,
  SHOULD_REJECT: 0,
  PUBLISHED: 0,
  UNPUBLISHED: 0,
  REJECTED: 0,
  CLOSED: 0,
  EXPIRED: 0,
}

const STATUS_TONES: Record<JobStatus, string> = {
  CLOSED: 'neutral',
  DRAFT: 'draft',
  EXPIRED: 'neutral',
  NEEDS_REVIEW: 'warning',
  PENDING_REVIEW: 'review',
  PUBLISHED: 'published',
  REJECTED: 'danger',
  SHOULD_REJECT: 'danger',
  UNPUBLISHED: 'paused',
}

export function getTotalJobCount(counts: RecruiterJobStatusCounts) {
  return JOB_STATUSES.reduce((total, status) => total + counts[status], 0)
}

export function getStatusFilterCount(
  counts: RecruiterJobStatusCounts,
  filter: RecruiterJobsStatusFilter,
) {
  return filter === 'ALL' ? getTotalJobCount(counts) : counts[filter]
}

export function getStatusTone(status: JobStatus) {
  return STATUS_TONES[status]
}

export function getStatusQuery(status: RecruiterJobsStatusFilter) {
  return status === 'ALL' ? undefined : status
}

export function getAvailableJobActions(job: RecruiterJobResponse): ReadonlyArray<RecruiterJobAction> {
  const actions: RecruiterJobAction[] = []

  if (job.status === 'DRAFT') {
    actions.push('submit')
  }

  if (job.status === 'PUBLISHED') {
    actions.push('unpublish', 'close')
  }

  if (job.status === 'UNPUBLISHED') {
    actions.push('republish', 'close')
  }

  if (
    job.applicationCount === 0 &&
    (job.status === 'DRAFT' || job.status === 'REJECTED' || job.status === 'UNPUBLISHED')
  ) {
    actions.push('delete')
  }

  return actions
}

export function formatRecruiterJobDate(
  value: string | null,
  locale: string,
  emptyLabel: string,
) {
  return formatDate(value, locale) || emptyLabel
}

export function formatRecruiterJobSalary(
  job: RecruiterJobResponse,
  locale: string,
  hiddenLabel: string,
  negotiableLabel: string,
) {
  if (!job.isSalaryVisible) {
    return hiddenLabel
  }

  return formatSalary(job, locale, negotiableLabel)
}

export function formatCompactNumber(value: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatJobCount(value: number, locale: string, suffix: string) {
  return `${formatCompactNumber(value, locale)} ${suffix}`
}
