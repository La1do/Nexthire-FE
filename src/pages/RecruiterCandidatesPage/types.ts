import type { WorkspaceCandidate, WorkspaceCandidateSort } from '../../services/applicationsWorkspace'
import type { ApplicationMatchLevel, ApplicationStatus } from '../../types/application.types'

export type CandidateSort = WorkspaceCandidateSort

export type CandidateStatusFilter = ApplicationStatus | 'all'

/** URL-synced list criteria (search, status, sort). */
export type CandidateCriteria = {
  query: string
  sort: CandidateSort
  status: CandidateStatusFilter
}

export type CandidateListRequest = CandidateCriteria & {
  page: number
}

/** One row: a person with every in-scope JD they applied to. */
export type CandidateRow = WorkspaceCandidate

export type CandidateJobLink = CandidateRow['applications'][number]

export type CandidateStatusLabels = Record<ApplicationStatus, string>

export type CandidateMatchLevelLabels = Record<ApplicationMatchLevel, string>
