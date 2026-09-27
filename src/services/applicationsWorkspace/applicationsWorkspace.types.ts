import type {
  ApplicationStatus,
  RecruiterApplicationQuery,
  RecruiterCandidateApplicationHistoryResponse,
  RecruiterCandidateResponse,
} from '../../types/application.types'
import type { CompanyJobListQuery, ListEnvelope } from '../../types/job.types'

/** CV group of a JD, see `getApplicationStage`. */
export type ApplicationStage = 'new' | 'inProgress' | 'decided'

export type ApplicationStageCounts = Record<ApplicationStage, number>

export type WorkspaceJobListQuery = CompanyJobListQuery & {
  /** Auth user id of the assignee (Staff filter). TODO(BE): server-side param. */
  assigneeId?: string
}

export type WorkspaceApplicationQuery = RecruiterApplicationQuery

/* ------------------------------------------------ D5: candidates by person --- */

export type WorkspaceCandidateSort = 'lastAppliedAt' | 'bestMatchScore' | 'applicationCount' | 'candidateName'

export type WorkspaceCandidateQuery = {
  page?: number
  limit?: number
  /** Name, email or JD title. */
  search?: string
  /** Keeps candidates with at least one in-scope application in this status. */
  status?: ApplicationStatus
  sortBy?: WorkspaceCandidateSort
}

/** One JD application of a candidate (only JDs in the caller's scope). */
export type WorkspaceCandidateApplication = RecruiterCandidateApplicationHistoryResponse

/**
 * One row per candidate. `applications` lists every in-scope JD application
 * (newest first); aggregates (count, latest, best match) are computed over them.
 */
export type WorkspaceCandidate = RecruiterCandidateResponse & {
  applications: WorkspaceCandidateApplication[]
}

export type WorkspaceCandidateListResponse = ListEnvelope<WorkspaceCandidate>
