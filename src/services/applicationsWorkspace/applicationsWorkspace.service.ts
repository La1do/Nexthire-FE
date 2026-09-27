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
 * - `cv.viewOwn` (Staff): JDs with `assigneeId === me`, CVs with `handlerId === me`.
 * - Otherwise: 403 (Axios-shaped), like the backend.
 * The real variant relies on the backend for this (TODO(BE)).
 */
import { can } from '../../lib/auth/permissions'
import type { PermissionSubject } from '../../lib/auth/permissions'
import type {
  Application,
  CompanyApplicationListResponse,
} from '../../types/application.types'
import type { Job, ListEnvelope } from '../../types/job.types'
import { jobService } from '../job.service'
import { isTeamMockEnabled, teamApplicationsService, teamJobsService } from '../team'
import { mockDelay, requireMockContext } from '../team/mock/mockStore'
import type { MockContext } from '../team/mock/mockStore'
import type {
  ApplicationStage,
  ApplicationStageCounts,
  WorkspaceApplicationQuery,
  WorkspaceJobListQuery,
} from './applicationsWorkspace.types'
import { createForbiddenError } from './forbiddenError'

const BULK_PAGE_LIMIT = 100

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

async function fetchAllPages<TItem>(
  loadPage: (page: number) => Promise<{ data: TItem[]; meta: { totalPages: number } }>,
): Promise<TItem[]> {
  const firstPage = await loadPage(1)
  const items = [...firstPage.data]

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await loadPage(page)
    items.push(...response.data)
  }

  return items
}

// The existing BE does not send assigneeId / handlerId yet (TODO(BE)); normalize to null.
function normalizeJob(job: Job): Job {
  return { ...job, assigneeId: job.assigneeId ?? null }
}

function normalizeApplication(application: Application): Application {
  return { ...application, handlerId: application.handlerId ?? null }
}

function paginateLocally<TItem>(items: TItem[], page = 1, limit = 20): ListEnvelope<TItem> {
  const safeLimit = Math.max(1, limit)
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * safeLimit

  return {
    data: items.slice(start, start + safeLimit),
    meta: { limit: safeLimit, page: safePage, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / safeLimit)) },
    success: true,
  }
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
}

/* ---------------------------------------------------------------- mock --- */

type MockScope = {
  jobs: Job[]
  applications: Application[]
}

/**
 * Staff (`cv.viewOwn`) CV scope — ASSUMPTION to confirm with the Lead:
 * CVs of JDs assigned to me, plus CVs I handle (`handlerId === me`).
 */
function isApplicationInOwnScope(application: Application, ownJobIds: ReadonlySet<string>, userId: string) {
  return ownJobIds.has(application.jobId) || application.handlerId === userId
}

function createMockSubject({ account, company, db }: MockContext): PermissionSubject {
  const member = db.members.find((item) => item.id === account.memberId)
  return { plan: company.plan, role: member?.role, status: member?.status ?? 'ACTIVE' }
}

/**
 * Data scope of the current mock session, decided with `can()` (mock services
 * may call it directly, ADR-01). No permission → 403, like the backend.
 */
async function loadMockScope(): Promise<MockScope> {
  const context = requireMockContext()
  const subject = createMockSubject(context)
  const [jobs, applications] = await Promise.all([
    fetchAllPages((page) => teamJobsService.listRecruiterJobs({ limit: BULK_PAGE_LIMIT, page })),
    fetchAllPages((page) => teamApplicationsService.listApplications({ limit: BULK_PAGE_LIMIT, page })),
  ])

  if (can(subject, 'cv.viewAll').allowed) {
    return { applications, jobs }
  }

  if (can(subject, 'cv.viewOwn').allowed) {
    const userId = context.account.userId
    const ownJobs = jobs.filter((job) => job.assigneeId === userId)
    const ownJobIds = new Set(ownJobs.map((job) => job.id))

    return {
      applications: applications.filter((application) => isApplicationInOwnScope(application, ownJobIds, userId)),
      jobs: ownJobs,
    }
  }

  throw createForbiddenError()
}

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
}

export const applicationsWorkspaceService: ApplicationsWorkspaceService = isTeamMockEnabled
  ? mockApplicationsWorkspaceService
  : realApplicationsWorkspaceService

