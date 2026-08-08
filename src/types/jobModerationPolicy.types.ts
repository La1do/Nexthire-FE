import type { CompanyTrustLevel } from './admin.types'
import type { JobExperienceLevel, JobType, JobWorkingType } from './job.types'

export type JobModerationPolicyStatus = 'ACTIVE' | 'DRAFT' | 'UNPUBLISHED' | 'ARCHIVED'
export type JobModerationDecision = 'PENDING_REVIEW' | 'NEEDS_REVIEW' | 'SHOULD_REJECT'
export type JobModerationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type JobModerationThresholds = {
  medium: number
  high: number
  critical: number
}

export type JobModerationKeywordRule = {
  id: string
  keyword: string
  score: number
  reason: string
  enabled: boolean
}

export type JobModerationContentRules = {
  minDescriptionLength: number
  descriptionScore: number
  minRequirementsLength: number
  requirementsScore: number
  missingLocationScore: number
}

export type JobModerationSalaryRule = {
  max: number
  score: number
}

export type JobModerationSalaryRules = {
  maxByExperienceLevel: Record<JobExperienceLevel, JobModerationSalaryRule>
}

export type JobModerationLinkRules = {
  shortenedDomains: string[]
  shortenedUrlScore: number
  maxExternalLinks: number
  tooManyExternalLinksScore: number
  externalFormDomains: string[]
  externalFormScore: number
}

export type JobModerationSpamRules = {
  allCapsTitleScore: number
  maxTitleSymbols: number
  excessiveSymbolsScore: number
  repeatedWordThreshold: number
  repeatedWordScore: number
}

export type JobModerationCrossSignalRules = {
  upfrontPaymentSignals: string[]
  remoteUpfrontPaymentScore: number
  internshipNoExperienceSalaryMax: number
  internshipNoExperienceSalaryScore: number
}

export type JobModerationCompanyTrustRules = {
  lowTrustScore: number
}

export type JobModerationRules = {
  thresholds: JobModerationThresholds
  keywordRules: JobModerationKeywordRule[]
  contentRules: JobModerationContentRules
  salaryRules: JobModerationSalaryRules
  linkRules: JobModerationLinkRules
  spamRules: JobModerationSpamRules
  crossSignalRules: JobModerationCrossSignalRules
  companyTrustRules: JobModerationCompanyTrustRules
}

export type JobModerationPolicy = {
  id: string
  name: string
  status: JobModerationPolicyStatus
  version: number
  rules: JobModerationRules
  createdByUserId: string | null
  updatedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export type JobModerationPolicyListQuery = {
  status?: JobModerationPolicyStatus
}

export type CreateJobModerationPolicyPayload = {
  name: string
  rules: JobModerationRules
}

export type UpdateJobModerationPolicyPayload = Partial<CreateJobModerationPolicyPayload>

export type JobModerationTestJob = {
  title: string
  description: string
  requirements: string
  skills: string[]
  salaryMin: number | null
  salaryMax: number | null
  experienceLevel: JobExperienceLevel
  workingType: JobWorkingType
  employmentType: JobType
  location: string
}

export type TestJobModerationPolicyPayload = {
  rules?: JobModerationRules
  companyTrustLevel: CompanyTrustLevel
  job: JobModerationTestJob
}

export type JobModerationTestResult = {
  decision: JobModerationDecision
  riskScore: number
  riskLevel: JobModerationRiskLevel
  reasons: string[]
  matchedRules: string[]
  policyId: string | null
  policyVersion: number | null
}
