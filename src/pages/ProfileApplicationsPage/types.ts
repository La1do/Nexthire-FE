import type { ProfileApplicationStatus } from '../../i18n/types'
import type { ApplicationProgress, ApplicationProgressStep } from '../../types/application.types'

export type CandidateApplicationStatus = ProfileApplicationStatus

export type CandidateApplication = {
  appliedAt: string
  companyName: string
  id: string
  currentProgressStep?: ApplicationProgressStep | null
  jobId: string
  jobTitle: string
  location: string
  salaryLabel: string
  cvFileName: string
  coverLetter: string
  progress?: ApplicationProgress | null
  status: CandidateApplicationStatus
  updatedAt: string
  workingType: string
}

export type ApplicationFilter = CandidateApplicationStatus | 'all'

export type ApplicationStatsValue = {
  active: number
  closed: number
  interviews: number
  total: number
}
