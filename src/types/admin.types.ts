import type {
  JobExperienceLevel,
  JobModerationRiskLevel,
  JobRevisionStatus,
  JobStatus,
  JobType,
  JobWorkingType,
  RecruiterJobResponse,
  RecruiterJobRevisionResponse,
} from './job.types'

export type ApiSuccessEnvelope<TData> = {
  success: true
  data: TData
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
}

export type PaginatedEnvelope<TItem> = ApiSuccessEnvelope<TItem[]> & {
  meta: PaginationMeta
}

export type AdminAiProvider = 'GEMINI' | 'OPENAI'
export type AdminAiUsageStatus = 'SUCCEEDED' | 'FAILED'

export type AdminAiSupportedModel = {
  id: string
  name: string
  isDefault: boolean
}

export type AdminAiCurrentConfig = {
  activeProvider: AdminAiProvider
  geminiModel: string
  openAiModel: string
  updatedByUserId: string | null
  updatedAt: string | null
}

export type AdminAiConfig = {
  currentConfig: AdminAiCurrentConfig
  supportedModels: Record<AdminAiProvider, AdminAiSupportedModel[]>
}

export type UpdateAdminAiConfigPayload = Partial<
  Pick<AdminAiCurrentConfig, 'activeProvider' | 'geminiModel' | 'openAiModel'>
>

export type AdminAiPricing = {
  currency: 'USD'
  inputUsdPerMillionTokens: number
  outputUsdPerMillionTokens: number
  multiplier: number
  formula: string
}

export type AdminAiUsageSummary = {
  provider: AdminAiProvider
  model: string
  totalRequests: number
  succeededRequests: number
  failedRequests: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCostUsd: string | null
  pricing: AdminAiPricing | null
}

export type AdminAiUsageLog = {
  id: string
  parseRequestId: string
  candidateId: string
  candidateCvId: string | null
  context: string
  provider: AdminAiProvider
  model: string
  operation: string
  status: AdminAiUsageStatus
  latencyMs: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  estimatedCostUsd: string | null
  errorCode: string | null
  errorMessage: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type AdminAiUsageLogQuery = {
  page?: number
  limit?: number
  provider?: AdminAiProvider
  model?: string
  status?: AdminAiUsageStatus
  candidateCvId?: string
  from?: string
  to?: string
}

export type AdminUserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN'
export type AdminUserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'LOCKED'
  | 'BANNED'
  | 'ARCHIVED'

export type AdminUserCompanySnapshot = {
  companyId: string
  companyName: string | null
  companyStatus: string | null
}

export type AdminUser = {
  id: string
  email: string
  phone: string | null
  fullName: string | null
  avatarUrl: string | null
  status: AdminUserStatus
  roles: AdminUserRole[]
  emailVerified: boolean
  company: AdminUserCompanySnapshot | null
  lastLoginAt: string | null
  statusReason: string | null
  statusChangedBy: string | null
  statusChangedAt: string | null
  suspendedAt: string | null
  bannedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminUserOverview = {
  total: number
  byStatus: Record<AdminUserStatus, number>
  byRole: Record<AdminUserRole, number>
  emailVerified: number
  emailUnverified: number
}

export type AdminUserListQuery = {
  page?: number
  limit?: number
  search?: string
  role?: AdminUserRole
  status?: AdminUserStatus
}

export type AdminReasonPayload = {
  reason: string
}

export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type CompanyTrustLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type AdminCompanySort = 'latest' | 'oldest' | 'rejected_count_desc'

export type AdminCompany = {
  id: string
  name: string
  logo?: string
  logoUrl?: string
  logoDocumentId?: string
  description?: string
  industry?: string
  size?: string
  foundedYear?: number
  mission?: string
  culture?: string
  values: string[]
  perks: string[]
  heroImageUrl?: string
  heroImageDocumentId?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  taxCode: string
  ownerId: string
  status: CompanyStatus
  canPostJobs: boolean
  completionPercent: number
  missingRequiredFields: string[]
  submittedAt: string | null
  rejectionReason: string | null
  statusReason: string | null
  statusChangedAt: string | null
  statusChangedByUserId: string | null
  verificationRejectedCount: number
  lastVerificationRejectedReason: string | null
  lastVerificationRejectedAt: string | null
  verificationReviewRequestedAt: string | null
  verificationReviewRequestedByUserId: string | null
  trustLevel: CompanyTrustLevel
  approvedLowRiskCount: number
  negativeTrustSignalCount: number
  createdAt: string
  updatedAt: string
}

export type AdminCompanyOverview = {
  total: number
  byStatus: Record<CompanyStatus, number>
  byTrustLevel: Record<CompanyTrustLevel, number>
  pendingReviewAgain: number
  rejectedBefore: number
}

export type AdminCompanyListQuery = {
  page?: number
  limit?: number
  status?: CompanyStatus
  trustLevel?: CompanyTrustLevel
  search?: string
  hasRejectedBefore?: boolean
  sort?: AdminCompanySort
}

export type CompanyVerificationActionPayload =
  | { action: 'APPROVE' }
  | { action: 'REJECT'; reason: string }

export type UpdateCompanyTrustLevelPayload = {
  trustLevel: CompanyTrustLevel
  reason: string
}

export type CompanyVerificationDocument = {
  id: string
  companyId: string
  documentId: string
  type: string
  uploadedByUserId: string
  documentType: string
  fileName: string
  mimeType: string
  size: number
  createdAt: string
  updatedAt: string
}

export type CompanyVerificationDocumentDownload = CompanyVerificationDocument & {
  url: string
  expiresInSeconds: number
}

export type CompanyTrustHistory = {
  id: string
  companyId: string
  previousTrustLevel: CompanyTrustLevel
  newTrustLevel: CompanyTrustLevel
  direction: string
  source: string
  reason: string
  changedByUserId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export type AdminJobSort = 'latest' | 'oldest' | 'risk_desc' | 'applications_desc'
export type AdminJobReviewStatus = Extract<
  JobStatus,
  'PENDING_REVIEW' | 'NEEDS_REVIEW' | 'SHOULD_REJECT'
>
export type AdminRevisionReviewStatus = Extract<
  JobRevisionStatus,
  'PENDING_REVIEW' | 'NEEDS_REVIEW' | 'SHOULD_REJECT'
>

export type AdminJob = RecruiterJobResponse
export type AdminJobRevision = RecruiterJobRevisionResponse

export type AdminJobListQuery = {
  page?: number
  limit?: number
  status?: JobStatus
  riskLevel?: JobModerationRiskLevel
  companyId?: string
  search?: string
  sort?: AdminJobSort
}

export type AdminJobReviewQueueQuery = {
  page?: number
  limit?: number
  status?: AdminJobReviewStatus
  search?: string
}

export type AdminRevisionReviewQueueQuery = {
  page?: number
  limit?: number
  status?: AdminRevisionReviewStatus
  search?: string
}

export type ReviewDecisionPayload = {
  decision: 'APPROVE' | 'REJECT'
  reason?: string
}

export type JobReasonPayload = {
  reason?: string
}

export type AdminJobOverview = {
  totalJobs: number
  jobsByStatus: Record<JobStatus, number>
  jobsWaitingReview: number
  publishedJobs: number
  unpublishedJobs: number
  closedJobs: number
  totalRevisions: number
  revisionsByStatus: Record<JobRevisionStatus, number>
  revisionsWaitingReview: number
}

export type AdminDashboardOverview = {
  users: AdminUserOverview
  companies: AdminCompanyOverview
  jobs: AdminJobOverview
}

export type AdminUserGrowthPeriod = '7d' | '30d' | '90d'

export type AdminUserGrowthPoint = {
  date: string
  totalUsers: number
  newUsers: number
}

export type AdminUserGrowthSeriesPoint = {
  bucket: string
  registeredUsers: number
  candidates: number
  recruiters: number
  admins: number
  bannedUsers: number
  suspendedUsers: number
  archivedUsers: number
}

export type AdminUserGrowthSeries = {
  from: string
  to: string
  bucket: 'day' | 'month'
  points: AdminUserGrowthSeriesPoint[]
}

export type AdminDashboardGrowthSeries = {
  users: AdminUserGrowthSeries
  companies: { from: string; to: string; bucket: 'day' | 'month'; points: unknown[] }
  jobs: { from: string; to: string; bucket: 'day' | 'month'; points: unknown[] }
}

export type AdminDashboardGrowthQuery = {
  from?: string
  to?: string
  bucket?: 'day' | 'month'
}

export type AdminGrowthMetric = {
  previousValue: number
  change: number
  percent: number | null
}

export type AdminGrowthRange = {
  from: string
  to: string
  comparisonFrom: string
  comparisonTo: string
}

export type AdminUserGrowthSummary = AdminGrowthRange & {
  registeredUsers: number
  candidates: number
  recruiters: number
  admins: number
  bannedUsers: number
  suspendedUsers: number
  archivedUsers: number
  growth: {
    registeredUsers: AdminGrowthMetric
    candidates: AdminGrowthMetric
    recruiters: AdminGrowthMetric
    admins: AdminGrowthMetric
    bannedUsers: AdminGrowthMetric
    suspendedUsers: AdminGrowthMetric
    archivedUsers: AdminGrowthMetric
  }
}

export type AdminCompanyGrowthSummary = AdminGrowthRange & {
  registeredCompanies: number
  approvedCompanies: number
  rejectedCompanies: number
  suspendedCompanies: number
  reviewRequestedAgain: number
  growth: {
    registeredCompanies: AdminGrowthMetric
    approvedCompanies: AdminGrowthMetric
    rejectedCompanies: AdminGrowthMetric
    suspendedCompanies: AdminGrowthMetric
    reviewRequestedAgain: AdminGrowthMetric
  }
}

export type AdminJobGrowthSummary = AdminGrowthRange & {
  createdJobs: number
  publishedJobs: number
  unpublishedJobs: number
  closedJobs: number
  reviewedJobs: number
  rejectedJobs: number
  applicationsSubmitted: number
  growth: {
    createdJobs: AdminGrowthMetric
    publishedJobs: AdminGrowthMetric
    unpublishedJobs: AdminGrowthMetric
    closedJobs: AdminGrowthMetric
    reviewedJobs: AdminGrowthMetric
    rejectedJobs: AdminGrowthMetric
    applicationsSubmitted: AdminGrowthMetric
  }
}

export type AdminJobFormSnapshot = {
  title: string
  description: string
  requirements: string
  skills: string[]
  benefits: string | null
  categoryId: string | null
  employmentType: JobType
  workingType: JobWorkingType
  experienceLevel: JobExperienceLevel
  location: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  isSalaryVisible: boolean
  deadline: string | null
  numberOfOpenings: number | null
}
