import type { ApplicationStatus } from '../../types/application.types'
import type { SavedJobStatus } from '../../types/savedJob.types'

export type CandidateManagedJobSource = 'saved' | 'applied'
export type CandidateManagedJobFilter = 'all' | 'saved' | 'applied' | 'active' | 'closed'
export type CandidateManagedJobSort = 'newest' | 'deadline' | 'salary'

export type CandidateManagedJob = {
  appliedAt?: string
  applicationId?: string
  applicationStatus?: ApplicationStatus
  companyId?: string
  companyLogoUrl?: string | null
  companyName: string
  deadline?: string | null
  deadlineSortValue: number
  isApplied: boolean
  isSaved: boolean
  jobId: string
  jobStatus?: SavedJobStatus
  location: string
  needsAttention: boolean
  salaryLabel: string
  salarySortValue: number
  savedAt?: string
  source: CandidateManagedJobSource
  title: string
  updatedAt?: string
}

export type CandidateManagedJobsStats = {
  active: number
  applied: number
  needsAttention: number
  saved: number
}

export type CandidateManagedJobTabCounts = Record<CandidateManagedJobFilter, number>
