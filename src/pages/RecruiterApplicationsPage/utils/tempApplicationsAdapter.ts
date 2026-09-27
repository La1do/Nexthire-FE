/**
 * TEMPORARY data adapter for the two-tier applications UI.
 *
 * TODO(A0): replace with feature mock service
 * ---------------------------------------------------------------------------
 * PR A0 (`feature/rbac-contract`) provides `src/services/team`:
 *   teamJobsService.listRecruiterJobs(params?)       -> ListEnvelope<Job>
 *   teamApplicationsService.listApplications(params?) -> CompanyApplicationListResponse
 *   teamCompanyService.listMembers()                 -> Member[]
 * The three `temp*Service` objects below have the SAME method names, params and
 * result shapes (field names `assigneeId` / `handlerId` / Member `userId`/`name`).
 * Swap = delete them, `import { teamJobsService, teamApplicationsService,
 * teamCompanyService } from '../../../services/team'` (or the feature mock service
 * built on top of them) and replace the mirror types in `../types.ts` with A0's.
 *
 * Rules kept here on purpose:
 * - Scoping/filtering (Staff -> assigned JDs / handled CVs, filter by staff)
 *   happens in the service/mock layer, never in components.
 * - No role checks anywhere. Access is decided by data (is the JD in scope?).
 */
import { applicationService } from '../../../services/application.service'
import { jobService } from '../../../services/job.service'
import type { ApplicationResponse, RecruiterApplicationQuery } from '../../../types/application.types'
import type { ApiMeta, RecruiterJobListQuery, RecruiterJobResponse } from '../../../types/job.types'
import type {
  ApplicationJobAccess,
  ApplicationJobCounts,
  ApplicationJobListFilters,
  ApplicationJobListResult,
  ApplicationJobStage,
  ApplicationJobSummary,
  ApplicationStaffOption,
  ApplicationWithHandler,
  JobApplicationsPage,
  JobApplicationsRequest,
  RecruiterApplicationCriteria,
  RecruiterApplicationJobOption,
  RecruiterApplicationStats,
  RecruiterApplicationStatus,
  TeamApplication,
  TeamJob,
  TeamMember,
} from '../types'
import { createForbiddenError } from './applicationAccessErrors'

const BULK_PAGE_LIMIT = 100

type DecisionStatus = Extract<RecruiterApplicationStatus, 'OFFERED' | 'REJECTED'>

type TeamListResponse<TItem> = {
  data: TItem[]
  meta: ApiMeta
}

/* ---------------------------------------------------------------------------
 * TODO(A0): temp stand-ins for `src/services/team`. Same signatures as A0.
 * The existing BE does not return `assigneeId` / `handlerId` yet (A0's real
 * services have the same TODO(BE)); read them when present, else null.
 * ------------------------------------------------------------------------- */

function toTeamJob(job: RecruiterJobResponse): TeamJob {
  return { ...job, assigneeId: (job as Partial<TeamJob>).assigneeId ?? null }
}

function toTeamApplication(application: ApplicationResponse): TeamApplication {
  return { ...application, handlerId: (application as Partial<TeamApplication>).handlerId ?? null }
}

const tempTeamJobsService = {
  async listRecruiterJobs(params?: RecruiterJobListQuery): Promise<TeamListResponse<TeamJob>> {
    const response = await jobService.getRecruiterJobs(params)
    return { data: response.data.map(toTeamJob), meta: response.meta }
  },
}

const tempTeamApplicationsService = {
  async listApplications(params?: RecruiterApplicationQuery): Promise<TeamListResponse<TeamApplication>> {
    const response = await applicationService.getRecruiterApplications(params)
    return { data: response.data.map(toTeamApplication), meta: response.meta }
  },
}

const tempTeamCompanyService = {
  // No members endpoint on develop yet (A0 real service: TODO(BE) `/companies/me/members`).
  async listMembers(): Promise<TeamMember[]> {
    return []
  },
}

/* ------------------------------------------------------------------------- */

async function fetchAllPages<TItem>(
  loadPage: (page: number) => Promise<TeamListResponse<TItem>>,
): Promise<TItem[]> {
  const firstPage = await loadPage(1)
  const items = [...firstPage.data]

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await loadPage(page)
    items.push(...response.data)
  }

  return items
}

/** JDs in the current member's scope (the service/BE scopes Staff to assigned JDs). */
function fetchScopedJobs(query = '') {
  return fetchAllPages((page) =>
    tempTeamJobsService.listRecruiterJobs({ limit: BULK_PAGE_LIMIT, page, q: query.trim() || undefined }),
  )
}

/** CVs in the current member's scope (the service/BE scopes Staff to handled CVs). */
function fetchScopedApplications() {
  return fetchAllPages((page) => tempTeamApplicationsService.listApplications({ limit: BULK_PAGE_LIMIT, page }))
}

type MemberNameLookup = (userId: string | null) => string | null

/**
 * Assignee/handler ids are auth user ids -> match Member.userId (fallback Member.id).
 * A failing members call must not break the lists: names just stay empty.
 */
async function loadMemberNameLookup(): Promise<MemberNameLookup> {
  let members: TeamMember[] = []

  try {
    members = await tempTeamCompanyService.listMembers()
  } catch {
    members = []
  }

  const names = new Map<string, string>()

  for (const member of members) {
    names.set(member.userId ?? member.id, member.name)
  }

  return (userId) => (userId ? names.get(userId) ?? null : null)
}

/**
 * PROVISIONAL stage classification (pending Lead confirmation) — keep it in
 * this single function so it is easy to change:
 * - new:        SUBMITTED without handlerId
 * - inProgress: SUBMITTED with handlerId
 * - decided:    OFFERED or REJECTED
 * - CANCELLED:  not counted
 */
export function getApplicationStage(application: Pick<TeamApplication, 'handlerId' | 'status'>): ApplicationJobStage | null {
  if (application.status === 'OFFERED' || application.status === 'REJECTED') {
    return 'decided'
  }

  if (application.status === 'SUBMITTED') {
    return application.handlerId ? 'inProgress' : 'new'
  }

  return null
}

function createEmptyCounts(): ApplicationJobCounts {
  return { decided: 0, inProgress: 0, new: 0 }
}

function groupCountsByJob(applications: ReadonlyArray<TeamApplication>) {
  const countsByJob = new Map<string, ApplicationJobCounts>()

  for (const application of applications) {
    const stage = getApplicationStage(application)

    if (!stage) {
      continue
    }

    const counts = countsByJob.get(application.jobId) ?? createEmptyCounts()
    counts[stage] += 1
    countsByJob.set(application.jobId, counts)
  }

  return countsByJob
}

function toJobSummary(job: TeamJob, counts: ApplicationJobCounts, getName: MemberNameLookup): ApplicationJobSummary {
  return {
    assigneeId: job.assigneeId,
    assigneeName: getName(job.assigneeId),
    counts,
    id: job.id,
    status: job.status,
    title: job.title,
    totalApplications: job.applicationCount,
  }
}

/** Staff options = assignees of the JDs in scope (data-derived, no role checks). */
function collectStaffOptions(jobs: ReadonlyArray<ApplicationJobSummary>): ApplicationStaffOption[] {
  const staff = new Map<string, string>()

  for (const job of jobs) {
    if (job.assigneeId && job.assigneeName) {
      staff.set(job.assigneeId, job.assigneeName)
    }
  }

  return Array.from(staff, ([id, name]) => ({ id, name })).sort((first, second) => first.name.localeCompare(second.name))
}

function withHandlerName(application: TeamApplication, getName: MemberNameLookup): ApplicationWithHandler {
  return { ...application, handlerName: getName(application.handlerId) }
}

/* ---------------------------------------------------------------------------
 * Feature-owned workspace service (the two functions A0 does not provide):
 * - getJob(jobId): one JD in the member's scope, Axios-shaped 403 otherwise
 * - getJobApplicationCounts(): per-JD CV counts (new / inProgress / decided)
 * TODO(A0): move into the feature mock service file built on `src/services/team`
 * and switch the 403 to the shared helper once it exists.
 * ------------------------------------------------------------------------- */
export const applicationsWorkspaceService = {
  /**
   * Data-level access: the JD must be in the member's scoped JD list, else a
   * 403 (`response.status === 403`). Transport errors (401, 5xx) pass through.
   */
  async getJob(jobId: string): Promise<TeamJob> {
    const jobs = await fetchScopedJobs()
    const job = jobs.find((item) => item.id === jobId)

    if (!job) {
      throw createForbiddenError()
    }

    return job
  },

  /** CV counts per JD id, using the provisional `getApplicationStage()` rule. */
  async getJobApplicationCounts(): Promise<ReadonlyMap<string, ApplicationJobCounts>> {
    const applications = await fetchScopedApplications()
    return groupCountsByJob(applications)
  },
}

/** Tier 1: JD list with CV counts, scoped and filtered in the data layer. */
export async function fetchApplicationJobs(filters: ApplicationJobListFilters): Promise<ApplicationJobListResult> {
  const [jobs, countsByJob, getName] = await Promise.all([
    fetchScopedJobs(filters.query),
    applicationsWorkspaceService.getJobApplicationCounts(),
    loadMemberNameLookup(),
  ])
  const summaries = jobs.map((job) => toJobSummary(job, countsByJob.get(job.id) ?? createEmptyCounts(), getName))
  const visibleJobs = filters.staffId === 'all'
    ? summaries
    : summaries.filter((job) => job.assigneeId === filters.staffId)

  return {
    jobs: visibleJobs,
    staffOptions: collectStaffOptions(summaries),
  }
}

/** Lightweight JD options for the tier-2 quick switcher (same scope as tier 1). */
export async function fetchApplicationJobOptions(): Promise<RecruiterApplicationJobOption[]> {
  const jobs = await fetchScopedJobs()
  return jobs.map((job) => ({ id: job.id, title: job.title }))
}

/** Tier 2 access check: resolves the JD view or rejects (403 / transport error). */
export async function fetchApplicationJobAccess(jobId: string): Promise<ApplicationJobAccess> {
  const [job, getName] = await Promise.all([applicationsWorkspaceService.getJob(jobId), loadMemberNameLookup()])

  return {
    assigneeId: job.assigneeId,
    assigneeName: getName(job.assigneeId),
    jobId: job.id,
    status: job.status,
    title: job.title,
  }
}

function getSortParams(criteria: RecruiterApplicationCriteria) {
  if (criteria.sort === 'score-desc') {
    return { sortBy: 'matchScore' as const, sortOrder: 'desc' as const }
  }

  if (criteria.sort === 'score-asc') {
    return { sortBy: 'matchScore' as const, sortOrder: 'asc' as const }
  }

  return { sortBy: 'submittedAt' as const, sortOrder: 'desc' as const }
}

export async function fetchJobApplications(jobId: string, request: JobApplicationsRequest): Promise<JobApplicationsPage> {
  const { criteria, limit, page } = request
  const [response, getName] = await Promise.all([
    tempTeamApplicationsService.listApplications({
      ...getSortParams(criteria),
      jobId,
      limit,
      page,
      search: criteria.query.trim() || undefined,
      status: criteria.status === 'all' ? undefined : criteria.status,
    }),
    loadMemberNameLookup(),
  ])

  return { items: response.data.map((application) => withHandlerName(application, getName)), meta: response.meta }
}

export async function fetchJobApplicationStats(jobId: string, query: string): Promise<RecruiterApplicationStats> {
  const countParams = { jobId, limit: 1, page: 1, search: query.trim() || undefined }
  const [total, submitted, offered, rejected] = await Promise.all([
    tempTeamApplicationsService.listApplications(countParams),
    tempTeamApplicationsService.listApplications({ ...countParams, status: 'SUBMITTED' }),
    tempTeamApplicationsService.listApplications({ ...countParams, status: 'OFFERED' }),
    tempTeamApplicationsService.listApplications({ ...countParams, status: 'REJECTED' }),
  ])
  const responded = offered.meta.total + rejected.meta.total
  const responseRate = total.meta.total > 0 ? Math.round((responded / total.meta.total) * 100) : 0

  return {
    interview: responded,
    new: submitted.meta.total,
    responseRate: `${responseRate}%`,
    total: total.meta.total,
  }
}

// TODO(A0): A0 has no single-application / CV / match / decision methods in
// `src/services/team` yet; these keep using the existing application.service.
export async function fetchApplicationDetail(applicationId: string): Promise<ApplicationWithHandler> {
  const [application, getName] = await Promise.all([
    applicationService.getRecruiterApplication(applicationId),
    loadMemberNameLookup(),
  ])
  return withHandlerName(toTeamApplication(application), getName)
}

export async function resolveApplicationJobId(applicationId: string): Promise<string> {
  const application = await applicationService.getRecruiterApplication(applicationId)
  return application.jobId
}

export function fetchApplicationCv(applicationId: string) {
  return applicationService.getRecruiterApplicationCv(applicationId)
}

export function requestApplicationMatch(applicationId: string) {
  return applicationService.runRecruiterApplicationMatch(applicationId)
}

export async function updateApplicationDecision(
  applicationId: string,
  status: DecisionStatus,
  note: string | null,
): Promise<ApplicationWithHandler> {
  const [application, getName] = await Promise.all([
    applicationService.updateRecruiterApplicationStatus(applicationId, { note, status }),
    loadMemberNameLookup(),
  ])
  return withHandlerName(toTeamApplication(application), getName)
}
