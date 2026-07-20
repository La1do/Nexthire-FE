import type { ApplicationStatus } from '../../types/application.types'
import type { CompanyStatus } from '../../types/company.types'

export type CompanyVerificationStatus =
  | CompanyStatus
  | 'NO_COMPANY'

export type CompanyVerificationFormValues = {
  name: string
  taxCode: string
  website: string
  address: string
  logo: string
  description: string
  documents: ReadonlyArray<string>
}

export type RecruiterCompany = {
  id: string | null
  address: string
  completion: number
  description: string
  logo: string
  name: string
  rejectionReason?: string
  status: CompanyVerificationStatus
  submittedAt: string
  taxCode: string
  website: string
}

export type RecruiterStatTone = 'amber' | 'blue' | 'coral' | 'green'

export type RecruiterStat = {
  id: string
  delta: string
  label: string
  tone: RecruiterStatTone
  value: string
}

export type RecruiterQuickAction = {
  id: string
  description: string
  disabledWhenUnverified?: boolean
  href: string
  label: string
}

export type RecruiterPipelineItem = {
  id: string
  count: number
  label: string
  tone: RecruiterStatTone
}

export type RecruiterApplication = {
  id: string
  candidateName: string
  role: string
  score: string
  stage: string
  status: ApplicationStatus
  submittedAt: string
}

export type RecruiterPerformancePoint = {
  count?: number
  id: string
  label: string
  value: number
}

export type RecruiterTask = {
  id: string
  description: string
  label: string
  tone: RecruiterStatTone
}

export type RecruiterDashboardData = {
  applications: ReadonlyArray<RecruiterApplication>
  company: RecruiterCompany
  performance: ReadonlyArray<RecruiterPerformancePoint>
  pipeline: ReadonlyArray<RecruiterPipelineItem>
  stats: ReadonlyArray<RecruiterStat>
  tasks: ReadonlyArray<RecruiterTask>
}
