/**
 * Feature-owned service for the recruiter applications workspace (D4):
 * `/recruiter/applications` (JD list + CV counts) and
 * `/recruiter/applications/:jobId` (CVs of one JD).
 *
 * Built on top of the A0 team services (`src/services/team`, not modified).
 * Real and mock variants share one signature and are switched by
 * `isTeamMockEnabled`, exactly like the team services (ADR-09 / ADR-12).
 *
 * Scoping lives HERE (service/mock layer), never in components:
 * - `cv.viewAll` (Manager, FREE Owner): every JD / CV of the company.
 * - `cv.viewOwn` (Staff): JDs with `assigneeId === me` and only the CVs of those JDs.
 * - Otherwise: 403 (Axios-shaped), like the backend.
 * The real variant relies on the backend for this (TODO(BE)).
 */
import { can } from '../../lib/auth/permissions'
import type {
  Application,
  CompanyApplicationListResponse,
} from '../../types/application.types'
import type { Member } from '../../types/company.types'
import type { Job, ListEnvelope } from '../../types/job.types'
import { jobService } from '../job.service'
import { isTeamMockEnabled, teamApplicationsService, teamCompanyService, teamJobsService } from '../team'
import { mockDelay } from '../team/mock/mockStore'
import type {
  ApplicationStage,
  ApplicationStageCounts,
  WorkspaceApplicationQuery,
  WorkspaceJobListQuery,
} from './applicationsWorkspace.types'
import { createForbiddenError } from './forbiddenError'
import { loadMockScope } from './workspaceMockScope'
import { BULK_PAGE_LIMIT, fetchAllPages, paginateLocally } from './workspaceShared'

/**
 * THE classification of a CV into a JD group (approved mapping):
 * - `new`:        SUBMITTED without `handlerId`
 * - `inProgress`: SUBMITTED with `handlerId`
 * - `decided`:    OFFERED or REJECTED
 * - `null`:       not grouped (CANCELLED; any status not listed above)
 * Pure function; components only consume its results (counts).
 */
export function getApplicationStage(application: Pick<Application, 'handlerId' | 'status'>): ApplicationStage | null {
  switch (application.status) {
    case 'SUBMITTED':
      return application.handlerId ? 'inProgress' : 'new'
    case 'OFFERED':
    case 'REJECTED':
      return 'decided'
    default:
      return null
  }
}

export function createEmptyStageCounts(): ApplicationStageCounts {
  return { decided: 0, inProgress: 0, new: 0 }
}

function groupStageCountsByJob(applications: ReadonlyArray<Application>): Record<string, ApplicationStageCounts> {
  const countsByJob: Record<string, ApplicationStageCounts> = {}

  for (const application of applications) {
    const stage = getApplicationStage(application)

    if (!stage) {
      continue
    }

    countsByJob[application.jobId] ??= createEmptyStageCounts()
    countsByJob[application.jobId][stage] += 1
  }

  return countsByJob
}

// The existing BE does not send assigneeId / handlerId yet (TODO(BE)); normalize to null.
function normalizeJob(job: Job): Job {
  return { ...job, assigneeId: job.assigneeId ?? null }
}

function normalizeApplication(application: Application): Application {
  return { ...application, handlerId: application.handlerId ?? null }
}

function filterByAssignee(jobs: Job[], assigneeId: string | undefined) {
  return assigneeId ? jobs.filter((job) => job.assigneeId === assigneeId) : jobs
}

type ApplicationsWorkspaceService = {
  /** JDs in the caller's scope. `assigneeId` filters by assignee (Staff filter). */
  listJobs: (params?: WorkspaceJobListQuery) => Promise<ListEnvelope<Job>>
  /** CVs in the caller's scope. */
  listApplications: (params?: WorkspaceApplicationQuery) => Promise<CompanyApplicationListResponse>
  /** One JD in the caller's scope; Axios-shaped 403 (`response.status === 403`) otherwise. */
  getJob: (jobId: string) => Promise<Job>
  /** CV group counts per JD id (only CVs in the caller's scope), via `getApplicationStage`. */
  getJobApplicationCounts: () => Promise<Record<string, ApplicationStageCounts>>
  /**
   * ACTIVE company members holding the Staff CV scope (options of the Staff filter).
   * Built on `teamCompanyService` (already mock/real switched), so one implementation serves both.
   */
  listStaffMembers: () => Promise<Member[]>
}

/**
 * "Staff" = ACTIVE member whose (plan, role) grants `cv.viewOwn` — the Staff CV scope.
 * Decided with `can()` instead of a role literal (ADR-04: no role comparisons outside permissions.ts).
 */
async function listStaffMembers(): Promise<Member[]> {
  const [members, subscription] = await Promise.all([
    teamCompanyService.listMembers(),
    teamCompanyService.getCompanyPlan(),
  ])

  return members.filter(
    (member) =>
      member.status === 'ACTIVE' &&
      can({ plan: subscription.plan, role: member.role, status: member.status }, 'cv.viewOwn').allowed,
  )
}

/* ---------------------------------------------------------------- mock --- */

const mockApplicationsWorkspaceService: ApplicationsWorkspaceService = {
  async listJobs(params = {}) {
    const { jobs } = await loadMockScope()
    const query = params.q?.trim().toLowerCase()
    const filtered = filterByAssignee(jobs, params.assigneeId).filter(
      (job) => (!params.status || job.status === params.status) && (!query || job.title.toLowerCase().includes(query)),
    )

    return mockDelay(paginateLocally(filtered, params.page, params.limit))
  },

  async listApplications(params = {}) {
    const { applications } = await loadMockScope()
    const search = params.search?.trim().toLowerCase()
    const filtered = applications.filter(
      (application) =>
        (!params.jobId || application.jobId === params.jobId) &&
        (!params.status || application.status === params.status) &&
        (!search || application.candidateFullName.toLowerCase().includes(search)),
    )

    return mockDelay(paginateLocally(filtered, params.page, params.limit))
  },

  async getJob(jobId) {
    const { jobs } = await loadMockScope()
    const job = jobs.find((item) => item.id === jobId)

    if (!job) {
      throw createForbiddenError()
    }

    return mockDelay(job)
  },

  async getJobApplicationCounts() {
    const { applications } = await loadMockScope()
    return mockDelay(groupStageCountsByJob(applications))
  },

  listStaffMembers,
}

/* ---------------------------------------------------------------- real --- */

const realApplicationsWorkspaceService: ApplicationsWorkspaceService = {
  async listJobs(params = {}) {
    const { assigneeId, ...query } = params

    if (!assigneeId) {
      const response = await teamJobsService.listRecruiterJobs(query)
      return { ...response, data: response.data.map(normalizeJob) }
    }

    // TODO(BE): server-side `assigneeId` filter; until then filter the full scoped list.
    const jobs = await fetchAllPages((page) =>
      teamJobsService.listRecruiterJobs({ ...query, limit: BULK_PAGE_LIMIT, page }),
    )
    return paginateLocally(filterByAssignee(jobs.map(normalizeJob), assigneeId), params.page, params.limit)
  },

  async listApplications(params) {
    const response = await teamApplicationsService.listApplications(params)
    return { ...response, data: response.data.map(normalizeApplication) }
  },

  async getJob(jobId) {
    // TODO(BE): the backend enforces JD ownership and answers 403; errors pass through untouched.
    const job = await jobService.getRecruiterJobById(jobId)
    return normalizeJob(job as Job)
  },

  async getJobApplicationCounts() {
    const applications = await fetchAllPages((page) =>
      teamApplicationsService.listApplications({ limit: BULK_PAGE_LIMIT, page }),
    )
    return groupStageCountsByJob(applications.map(normalizeApplication))
  },

  listStaffMembers,
}

export const applicationsWorkspaceService: ApplicationsWorkspaceService = isTeamMockEnabled
  ? mockApplicationsWorkspaceService
  : realApplicationsWorkspaceService

