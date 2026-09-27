/**
 * Page-level data composition for the applications workspace. All data comes
 * from services (scoping, 403 and CV grouping are decided there); this file
 * only maps service results into page view types for the React Query hooks.
 */
import { applicationService } from '../../../services/application.service'
import { applicationsWorkspaceService, createEmptyStageCounts } from '../../../services/applicationsWorkspace'
import { teamCompanyService } from '../../../services/team'
import type { Application, ApplicationResponse } from '../../../types/application.types'
import type { Member } from '../../../types/company.types'
import type { Job } from '../../../types/job.types'
import type {
  ApplicationJobAccess,
  ApplicationJobCounts,
  ApplicationJobListFilters,
  ApplicationJobListResult,
  ApplicationJobSummary,
  ApplicationStaffOption,
  ApplicationWithHandler,
  JobApplicationsPage,
  JobApplicationsRequest,
  RecruiterApplicationCriteria,
  RecruiterApplicationJobOption,
  RecruiterApplicationStats,
  RecruiterApplicationStatus,
} from '../types'

const BULK_PAGE_LIMIT = 100

type DecisionStatus = Extract<RecruiterApplicationStatus, 'OFFERED' | 'REJECTED'>

type MemberNameLookup = (userId: string | null) => string | null

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

function fetchScopedJobs(query: { q?: string; assigneeId?: string } = {}) {
  return fetchAllPages((page) =>
    applicationsWorkspaceService.listJobs({ ...query, limit: BULK_PAGE_LIMIT, page }),
  )
}

/**
 * Assignee/handler ids are auth user ids → Member.userId (fallback Member.id).
 * The members endpoint may not exist yet on the real BE (TODO(BE)); a failure
 * only leaves names empty, it never breaks the lists.
 */
async function loadMemberNameLookup(): Promise<MemberNameLookup> {
  let members: Member[] = []

  try {
    members = await teamCompanyService.listMembers()
  } catch {
    members = []
  }

  const names = new Map<string, string>()

  for (const member of members) {
    names.set(member.userId ?? member.id, member.name)
  }

  return (userId) => (userId ? names.get(userId) ?? null : null)
}

function toJobSummary(job: Job, counts: ApplicationJobCounts, getName: MemberNameLookup): ApplicationJobSummary {
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

/** Staff filter options = assignees of the JDs in scope (data-derived, no role checks). */
function collectStaffOptions(jobs: ReadonlyArray<ApplicationJobSummary>): ApplicationStaffOption[] {
  const staff = new Map<string, string>()

  for (const job of jobs) {
    if (job.assigneeId && job.assigneeName) {
      staff.set(job.assigneeId, job.assigneeName)
    }
  }

  return Array.from(staff, ([id, name]) => ({ id, name })).sort((first, second) => first.name.localeCompare(second.name))
}

function toApplication(application: ApplicationResponse): Application {
  return { ...application, handlerId: (application as Partial<Application>).handlerId ?? null }
}

function withHandlerName(application: Application, getName: MemberNameLookup): ApplicationWithHandler {
  return { ...application, handlerName: getName(application.handlerId) }
}

/** Tier 1: JD list with CV group counts. `staffId` is passed to the service as `assigneeId`. */
export async function fetchApplicationJobs(filters: ApplicationJobListFilters): Promise<ApplicationJobListResult> {
  const assigneeId = filters.staffId === 'all' ? undefined : filters.staffId
  const query = filters.query.trim() || undefined
  const [jobs, allJobs, countsByJob, getName] = await Promise.all([
    fetchScopedJobs({ assigneeId, q: query }),
    // Staff options come from the unfiltered scope so the select keeps all choices.
    assigneeId ? fetchScopedJobs({ q: query }) : Promise.resolve(null),
    applicationsWorkspaceService.getJobApplicationCounts(),
    loadMemberNameLookup(),
  ])
  const toSummary = (job: Job) => toJobSummary(job, countsByJob[job.id] ?? createEmptyStageCounts(), getName)
  const summaries = jobs.map(toSummary)

  return {
    jobs: summaries,
    staffOptions: collectStaffOptions(allJobs ? allJobs.map(toSummary) : summaries),
  }
}

/** JD options for the tier-2 quick switcher (same scope as tier 1). */
export async function fetchApplicationJobOptions(): Promise<RecruiterApplicationJobOption[]> {
  const jobs = await fetchScopedJobs()
  return jobs.map((job) => ({ id: job.id, title: job.title }))
}

/** Tier 2 access check: resolves the JD or rejects (Axios 403 from the service / transport error). */
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
    applicationsWorkspaceService.listApplications({
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
    applicationsWorkspaceService.listApplications(countParams),
    applicationsWorkspaceService.listApplications({ ...countParams, status: 'SUBMITTED' }),
    applicationsWorkspaceService.listApplications({ ...countParams, status: 'OFFERED' }),
    applicationsWorkspaceService.listApplications({ ...countParams, status: 'REJECTED' }),
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

// A0 has no single-application / CV / match / decision methods; these use the
// existing application.service (real endpoints only, not mocked yet).
export async function fetchApplicationDetail(applicationId: string): Promise<ApplicationWithHandler> {
  const [application, getName] = await Promise.all([
    applicationService.getRecruiterApplication(applicationId),
    loadMemberNameLookup(),
  ])
  return withHandlerName(toApplication(application), getName)
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
  return withHandlerName(toApplication(application), getName)
}
