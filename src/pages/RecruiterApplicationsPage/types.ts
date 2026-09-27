import type {
  ApplicationCvParseStatus,
  ApplicationMatchDecision,
  ApplicationMatchLevel,
  ApplicationMatchPriority,
  ApplicationMatchRecommendation,
  ApplicationResponse,
  ApplicationStatus,
} from '../../types/application.types'
import type { ApiMeta, JobStatus, RecruiterJobResponse } from '../../types/job.types'

export type RecruiterApplicationStatus = ApplicationStatus

export type RecruiterApplicationSort = 'newest' | 'score-desc' | 'score-asc'

export type RecruiterApplicationTimelineItem = {
  id: string
  date: string
  description: string
  label: string
}

export type RecruiterApplicationItem = {
  id: string
  candidateEmail: string
  candidateHeadline: string
  candidateLocation: string
  candidateName: string
  candidatePhone: string
  coverLetter: string
  cvFileName: string
  cvParseStatus: ApplicationCvParseStatus
  decidedAt: string | null
  expectedSalary: string
  experience: string
  handlerName: string | null
  jobId: string
  jobTitle: string
  matchDecision: ApplicationMatchDecision | null
  matchLevel: ApplicationMatchLevel | null
  matchMatchedSkills: ReadonlyArray<string>
  matchMissingSkills: ReadonlyArray<string>
  matchNextActions: ReadonlyArray<string>
  matchPriority: ApplicationMatchPriority | null
  matchRecommendation: ApplicationMatchRecommendation | null
  matchRiskFlags: ReadonlyArray<string>
  matchScore: number | null
  matchSummary: string | null
  portfolioUrl?: string
  resumeUrl?: string
  skills: ReadonlyArray<string>
  status: RecruiterApplicationStatus
  statusNote: string | null
  submittedAt: string
  submittedAtOrder: number
  timeline: ReadonlyArray<RecruiterApplicationTimelineItem>
  updatedAt: string
}

export type RecruiterApplicationCriteria = {
  query: string
  sort: RecruiterApplicationSort
  status: RecruiterApplicationStatus | 'all'
}

export type RecruiterApplicationJobOption = {
  id: string
  title: string
}

export type RecruiterApplicationStats = {
  interview: number
  new: number
  responseRate: string
  total: number
}

/* ---------------------------------------------------------------------------
 * A0 contract mirrors.
 * TODO(A0): delete these and import `Job`, `CompanyJobStatus` (job.types.ts),
 * `Application` (application.types.ts) and `Member` (company.types.ts) once
 * `feature/rbac-contract` is merged. Field names intentionally match A0.
 * ------------------------------------------------------------------------- */

/** Mirrors A0 `CompanyJobStatus` (platform JobStatus + internal approval workflow). */
export type ApplicationJobStatus = JobStatus | 'PENDING_APPROVAL' | 'RETURNED'

/** Mirrors A0 `Job`. `assigneeId` is the auth user id of the responsible member. */
export type TeamJob = Omit<RecruiterJobResponse, 'status'> & {
  status: ApplicationJobStatus
  assigneeId: string | null
}

/** Mirrors A0 `Application`. `handlerId` is the auth user id of the handling member. */
export type TeamApplication = ApplicationResponse & {
  handlerId: string | null
}

/** Mirrors the fields of A0 `Member` used for assignee/handler name lookup. */
export type TeamMember = {
  id: string
  userId?: string | null
  companyId: string
  name: string
  email: string
}

/* ---------------------------------------------------------------------------
 * Two-tier view types (tier 1: JD list, tier 2: CVs of one JD).
 * Page-local on purpose: components depend on these, never on raw service
 * shapes, so the A0 swap only touches utils/tempApplicationsAdapter.ts.
 * ------------------------------------------------------------------------- */

export type ApplicationJobStage = 'new' | 'inProgress' | 'decided'

export type ApplicationJobCounts = Record<ApplicationJobStage, number>

export type ApplicationJobSummary = {
  id: string
  title: string
  status: ApplicationJobStatus
  assigneeId: string | null
  assigneeName: string | null
  counts: ApplicationJobCounts
  totalApplications: number
}

export type ApplicationJobListFilters = {
  query: string
  /** Assignee (auth user id) filter, applied by the data layer. */
  staffId: string | 'all'
}

export type ApplicationStaffOption = {
  id: string
  name: string
}

export type ApplicationJobListResult = {
  jobs: ReadonlyArray<ApplicationJobSummary>
  staffOptions: ReadonlyArray<ApplicationStaffOption>
}

export type ApplicationJobAccess = {
  assigneeId: string | null
  assigneeName: string | null
  jobId: string
  status: ApplicationJobStatus
  title: string
}

/** Application enriched with the handler display name (resolved via members). */
export type ApplicationWithHandler = TeamApplication & {
  handlerName: string | null
}

export type JobApplicationsRequest = {
  criteria: RecruiterApplicationCriteria
  limit: number
  page: number
}

export type JobApplicationsPage = {
  items: ReadonlyArray<ApplicationWithHandler>
  meta: ApiMeta
}

/** Same shape as A0 `usePermission()` result (+ `isError`). */
export type ApplicationPermissionState = {
  allowed: boolean
  isError: boolean
  isLoading: boolean
}
