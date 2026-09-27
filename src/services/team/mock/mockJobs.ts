import { can, getJobVisibility } from '../../../lib/auth/permissions'
import type {
  CompanyJobListQuery,
  CompanyJobStatus,
  Job,
  JobStatus,
  ListEnvelope,
  RecruiterJobListQuery,
  RecruiterJobResponse,
  RecruiterJobStatusCounts,
} from '../../../types/job.types'
import { mockConflict, mockForbidden, mockNotFound } from './mockErrors'
import { appendMockAuditLog, mockDelay, paginateMock, requireMockContext, updateMockDb } from './mockStore'
import type { MockContext } from './mockStore'

/**
 * Jobs of the current company visible to the current mock user (like the backend):
 * visibility 'all' → every company job; 'own' → assigneeId === me; 'none' → Axios-shaped 403.
 */
export function listVisibleMockJobs(context: MockContext = requireMockContext()): Job[] {
  const visibility = getJobVisibility(context.subject)

  if (visibility === 'none') {
    throw mockForbidden('JOB.FORBIDDEN', 'You do not have access to company jobs.')
  }

  return context.db.jobs.filter(
    (job) => job.companyId === context.company.id && (visibility === 'all' || job.assigneeId === context.userId),
  )
}

/** One visible job or an Axios-shaped 404 (other company) / 403 (not assigned to this Staff member). */
export function findVisibleMockJob(id: string, context: MockContext = requireMockContext()): Job {
  const job = context.db.jobs.find((item) => item.id === id && item.companyId === context.company.id)

  if (!job) {
    throw mockNotFound('JOB.NOT_FOUND', 'Job not found.')
  }

  if (!listVisibleMockJobs(context).some((item) => item.id === id)) {
    throw mockForbidden('JOB.NOT_ASSIGNED', 'This job is not assigned to you.')
  }

  return job
}

function filterJobs<TJob extends { title: string; status: string }>(
  jobs: TJob[],
  params: { q?: string; status?: string },
) {
  const query = params.q?.trim().toLowerCase()
  return jobs.filter(
    (job) => (!params.status || job.status === params.status) && (!query || job.title.toLowerCase().includes(query)),
  )
}

/** Legacy recruiter pages only know platform statuses: map the internal ones to the closest platform status. */
const LEGACY_STATUS: Partial<Record<CompanyJobStatus, JobStatus>> = {
  PENDING_APPROVAL: 'PENDING_REVIEW',
  RETURNED: 'DRAFT',
}

export function toLegacyRecruiterJob(job: Job): RecruiterJobResponse {
  const { assigneeId: _assigneeId, returnReason: _returnReason, ...rest } = job
  return { ...rest, status: LEGACY_STATUS[job.status] ?? (job.status as JobStatus) }
}

const ALL_JOB_STATUSES: readonly JobStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'NEEDS_REVIEW',
  'SHOULD_REJECT',
  'PUBLISHED',
  'UNPUBLISHED',
  'REJECTED',
  'CLOSED',
  'EXPIRED',
]

/** Mock implementation of the company-scoped job endpoints. */
export const mockJobsApi = {
  async listRecruiterJobs(params: CompanyJobListQuery = {}): Promise<ListEnvelope<Job>> {
    return mockDelay(paginateMock(filterJobs(listVisibleMockJobs(), params), params.page, params.limit))
  },

  /**
   * Submit / publish a JD (DRAFT or RETURNED only):
   * - jd.publishDirect (Manager, Owner FREE) → PUBLISHED (+ JD_PUBLISHED_BY_MANAGER audit on PRO).
   * - jd.submit (Staff, own jobs only) → PENDING_APPROVAL; a RETURNED job's `returnReason` is cleared (+ JD_SUBMITTED audit).
   */
  async submitRecruiterJob(id: string): Promise<Job> {
    const context = requireMockContext()
    const visibleJob = findVisibleMockJob(id, context)

    if (visibleJob.status !== 'DRAFT' && visibleJob.status !== 'RETURNED') {
      throw mockConflict('JOB.INVALID_STATUS', 'Only draft or returned jobs can be submitted.')
    }

    const canPublish = can(context.subject, 'jd.publishDirect').allowed
    const canSubmit = can(context.subject, 'jd.submit').allowed

    if (!canPublish && !canSubmit) {
      throw mockForbidden('JOB.FORBIDDEN', 'You cannot submit jobs.')
    }

    const updated = updateMockDb((db) => {
      const job = db.jobs.find((item) => item.id === id)

      if (!job) {
        throw mockNotFound('JOB.NOT_FOUND', 'Job not found.')
      }

      const now = new Date().toISOString()
      job.updatedAt = now
      job.returnReason = null

      if (canPublish) {
        job.status = 'PUBLISHED'
        job.publishedAt = now

        if (can(context.subject, 'jd.approve').allowed) {
          appendMockAuditLog(db, {
            action: 'JD_PUBLISHED_BY_MANAGER',
            actorId: context.userId,
            actorName: context.fullName,
            companyId: context.company.id,
            targetId: job.id,
            targetLabel: job.title,
            targetType: 'JOB',
          })
        }
      } else {
        job.status = 'PENDING_APPROVAL'
        appendMockAuditLog(db, {
          action: 'JD_SUBMITTED',
          actorId: context.userId,
          actorName: context.fullName,
          companyId: context.company.id,
          targetId: job.id,
          targetLabel: job.title,
          targetType: 'JOB',
        })
      }

      return job
    })

    return mockDelay(updated)
  },

  // --- Legacy endpoints used by the existing recruiter pages (jobService) in a mock session ---

  async listLegacyRecruiterJobs(params: RecruiterJobListQuery = {}): Promise<ListEnvelope<RecruiterJobResponse>> {
    const jobs = filterJobs(listVisibleMockJobs().map(toLegacyRecruiterJob), params)
    return mockDelay(paginateMock(jobs, params.page, params.limit))
  },

  async getLegacyRecruiterJobStatusCounts(): Promise<RecruiterJobStatusCounts> {
    const counts = Object.fromEntries(ALL_JOB_STATUSES.map((status) => [status, 0])) as RecruiterJobStatusCounts
    listVisibleMockJobs()
      .map(toLegacyRecruiterJob)
      .forEach((job) => {
        counts[job.status] += 1
      })
    return mockDelay(counts)
  },

  async getLegacyRecruiterJobById(id: string): Promise<RecruiterJobResponse> {
    return mockDelay(toLegacyRecruiterJob(findVisibleMockJob(id)))
  },

  async submitLegacyRecruiterJob(id: string): Promise<RecruiterJobResponse> {
    return toLegacyRecruiterJob(await mockJobsApi.submitRecruiterJob(id))
  },
}
