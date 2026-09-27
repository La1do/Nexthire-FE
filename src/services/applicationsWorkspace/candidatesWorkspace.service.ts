/**
 * Feature-owned service for D5 `/recruiter/candidates`: one row per candidate
 * with every JD they applied to inside the company.
 *
 * Scoping lives HERE (service/mock layer), never in components:
 * - `cv.viewAll` (Manager, FREE Owner): every candidate of the company.
 * - `cv.viewOwn` (Staff): only candidates who applied to JDs assigned to me, and
 *   only those in-scope JDs are listed on the row (aggregates use them too).
 * - Otherwise: Axios-shaped 403, like the backend.
 *
 * Mock and real share one signature, switched by `isTeamMockEnabled` (ADR-09 / ADR-12).
 */
import { applicationService } from '../application.service'
import type { Application, ApplicationResponse, RecruiterCandidateResponse } from '../../types/application.types'
import { isTeamMockEnabled, teamApplicationsService } from '../team'
import { mockDelay } from '../team/mock/mockStore'
import type {
  WorkspaceCandidate,
  WorkspaceCandidateApplication,
  WorkspaceCandidateListResponse,
  WorkspaceCandidateQuery,
  WorkspaceCandidateSort,
} from './applicationsWorkspace.types'
import { createForbiddenError } from './forbiddenError'
import { loadMockScope } from './workspaceMockScope'
import { BULK_PAGE_LIMIT, fetchAllPages, paginateLocally } from './workspaceShared'

/** Person-level fields of a row; aggregates are derived from the applications. */
type CandidateProfile = Pick<
  RecruiterCandidateResponse,
  'avatarDocumentId' | 'avatarUrl' | 'candidateId' | 'candidateUserId' | 'email' | 'fullName' | 'headline' | 'location' | 'phone' | 'skills'
>

const DEFAULT_SORT: WorkspaceCandidateSort = 'lastAppliedAt'

function toHistoryItem(application: ApplicationResponse): WorkspaceCandidateApplication {
  return {
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    matchLevel: application.matchLevel,
    matchScore: application.matchScore,
    status: application.status,
    submittedAt: application.submittedAt,
  }
}

function byNewest(first: WorkspaceCandidateApplication, second: WorkspaceCandidateApplication) {
  return new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime()
}

/** Recomputes the row aggregates from the in-scope applications only. */
function summarizeCandidate(
  base: CandidateProfile,
  applications: WorkspaceCandidateApplication[],
): WorkspaceCandidate {
  const sorted = [...applications].sort(byNewest)
  const latest = sorted[0]
  const best = sorted.reduce<WorkspaceCandidateApplication | null>(
    (current, application) =>
      application.matchScore != null && (current?.matchScore == null || application.matchScore > current.matchScore)
        ? application
        : current,
    null,
  )

  return {
    ...base,
    applicationCount: sorted.length,
    applications: sorted,
    bestMatchLevel: best?.matchLevel ?? null,
    bestMatchScore: best?.matchScore ?? null,
    bestMatchedApplicationId: best?.id ?? null,
    bestMatchedJobId: best?.jobId ?? null,
    bestMatchedJobTitle: best?.jobTitle ?? null,
    lastAppliedAt: latest.submittedAt,
    latestApplicationId: latest.id,
    latestJobId: latest.jobId,
    latestJobTitle: latest.jobTitle,
    latestStatus: latest.status,
  }
}

function groupHistoryByCandidate(applications: ReadonlyArray<ApplicationResponse>) {
  const groups = new Map<string, ApplicationResponse[]>()

  for (const application of applications) {
    const group = groups.get(application.candidateId) ?? []
    group.push(application)
    groups.set(application.candidateId, group)
  }

  return groups
}

/** Mock: candidates are derived from the scoped applications. */
function buildCandidatesFromApplications(applications: ReadonlyArray<Application>): WorkspaceCandidate[] {
  return Array.from(groupHistoryByCandidate(applications).values(), (group) => {
    const newest = [...group].sort((first, second) => byNewest(toHistoryItem(first), toHistoryItem(second)))[0]

    return summarizeCandidate(
      {
        avatarDocumentId: newest.candidateAvatarDocumentId,
        avatarUrl: newest.candidateAvatarUrl,
        candidateId: newest.candidateId,
        candidateUserId: newest.candidateUserId,
        email: newest.candidateEmail,
        fullName: newest.candidateFullName,
        headline: newest.cvTitle,
        location: null,
        phone: newest.candidatePhone,
        skills: [],
      },
      group.map(toHistoryItem),
    )
  })
}

function matchesQuery(candidate: WorkspaceCandidate, params: WorkspaceCandidateQuery) {
  const search = params.search?.trim().toLowerCase()
  const matchesSearch = !search ||
    candidate.fullName.toLowerCase().includes(search) ||
    candidate.email.toLowerCase().includes(search) ||
    candidate.applications.some((application) => application.jobTitle.toLowerCase().includes(search))
  const matchesStatus = !params.status ||
    candidate.applications.some((application) => application.status === params.status)

  return matchesSearch && matchesStatus
}

function compareCandidates(sort: WorkspaceCandidateSort) {
  return (first: WorkspaceCandidate, second: WorkspaceCandidate) => {
    switch (sort) {
      case 'bestMatchScore':
        return (second.bestMatchScore ?? -1) - (first.bestMatchScore ?? -1)
      case 'applicationCount':
        return second.applicationCount - first.applicationCount
      case 'candidateName':
        return first.fullName.localeCompare(second.fullName)
      default:
        return new Date(second.lastAppliedAt).getTime() - new Date(first.lastAppliedAt).getTime()
    }
  }
}

type CandidatesWorkspaceService = {
  /** Candidates in the caller's scope, one row per person. */
  listCandidates: (params?: WorkspaceCandidateQuery) => Promise<WorkspaceCandidateListResponse>
  /** One candidate in the caller's scope; Axios-shaped 403 otherwise. */
  getCandidate: (candidateId: string) => Promise<WorkspaceCandidate>
}

/* ---------------------------------------------------------------- mock --- */

async function loadMockCandidates() {
  const { applications } = await loadMockScope()
  return buildCandidatesFromApplications(applications)
}

const mockCandidatesWorkspaceService: CandidatesWorkspaceService = {
  async listCandidates(params = {}) {
    const candidates = await loadMockCandidates()
    const filtered = candidates
      .filter((candidate) => matchesQuery(candidate, params))
      .sort(compareCandidates(params.sortBy ?? DEFAULT_SORT))

    return mockDelay(paginateLocally(filtered, params.page, params.limit))
  },

  async getCandidate(candidateId) {
    const candidate = (await loadMockCandidates()).find((item) => item.candidateId === candidateId)

    if (!candidate) {
      throw createForbiddenError()
    }

    return mockDelay(candidate)
  },
}

/* ---------------------------------------------------------------- real --- */

// TODO(BE): scope /recruiter/candidates server-side (Staff = assigned JDs only).
// Until then the rows are intersected with the applications the backend returns
// to this caller, so out-of-scope JDs never reach the UI.
async function loadScopedHistory() {
  const applications = await fetchAllPages((page) =>
    teamApplicationsService.listApplications({ limit: BULK_PAGE_LIMIT, page }),
  )
  return groupHistoryByCandidate(applications)
}

const realCandidatesWorkspaceService: CandidatesWorkspaceService = {
  async listCandidates(params = {}) {
    const sortBy = params.sortBy ?? DEFAULT_SORT
    const [response, historyByCandidate] = await Promise.all([
      applicationService.getRecruiterCandidates({
        limit: params.limit,
        page: params.page,
        search: params.search,
        sortBy,
        sortOrder: sortBy === 'candidateName' ? 'asc' : 'desc',
        status: params.status,
      }),
      loadScopedHistory(),
    ])

    return {
      ...response,
      data: response.data.flatMap((candidate) => {
        const history = historyByCandidate.get(candidate.candidateId)
        return history?.length ? [summarizeCandidate(candidate, history.map(toHistoryItem))] : []
      }),
    }
  },

  async getCandidate(candidateId) {
    const [detail, historyByCandidate] = await Promise.all([
      applicationService.getRecruiterCandidate(candidateId),
      loadScopedHistory(),
    ])
    const scopedIds = new Set((historyByCandidate.get(candidateId) ?? []).map((application) => application.id))
    const applications = detail.applications.filter((application) => scopedIds.has(application.id))

    if (applications.length === 0) {
      throw createForbiddenError()
    }

    return summarizeCandidate(detail, applications)
  },
}

export const candidatesWorkspaceService: CandidatesWorkspaceService =
  // `import.meta.env.DEV &&` lets the bundler drop the mock variant (and its seed imports) from production builds.
  import.meta.env.DEV && isTeamMockEnabled
  ? mockCandidatesWorkspaceService
  : realCandidatesWorkspaceService
