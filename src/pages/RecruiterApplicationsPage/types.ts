import type { ApplicationStage, ApplicationStageCounts } from '../../services/applicationsWorkspace'
import type {
  Application,
  ApplicationCvParseStatus,
  ApplicationMatchDecision,
  ApplicationMatchLevel,
  ApplicationMatchPriority,
  ApplicationMatchRecommendation,
  ApplicationStatus,
} from '../../types/application.types'
import type { ApiMeta, CompanyJobStatus } from '../../types/job.types'

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
 * Two-tier view types (tier 1: JD list, tier 2: CVs of one JD).
 * Components depend on these view types, never on raw service shapes.
 * ------------------------------------------------------------------------- */

export type ApplicationJobStatus = CompanyJobStatus

/** CV group of a JD, computed only by the service (`getApplicationStage`). */
export type ApplicationJobStage = ApplicationStage

export type ApplicationJobCounts = ApplicationStageCounts

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
export type ApplicationWithHandler = Application & {
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
