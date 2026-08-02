import type { ProfileApplicationStatus } from '../../i18n/types'

export type CandidateApplicationStatus = ProfileApplicationStatus

export type CandidateApplication = {
  appliedAt: string
  companyName: string
  id: string
  jobId: string
  jobTitle: string
  location: string
  salaryLabel: string
  cvFileName: string
  coverLetter: string
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
