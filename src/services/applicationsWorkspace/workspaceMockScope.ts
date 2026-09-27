/**
 * Mock-only data scope for the applications workspace (jobs + CVs the current
 * mock session may see). Decided with `can()` — mock services may call it
 * directly (ADR-01). No role literals here.
 */
import { can } from '../../lib/auth/permissions'
import type { PermissionSubject } from '../../lib/auth/permissions'
import type { Application } from '../../types/application.types'
import type { Job } from '../../types/job.types'
import { teamApplicationsService, teamJobsService } from '../team'
import { requireMockContext } from '../team/mock/mockStore'
import type { MockContext } from '../team/mock/mockStore'
import { createForbiddenError } from './forbiddenError'
import { BULK_PAGE_LIMIT, fetchAllPages } from './workspaceShared'

export type MockScope = {
  applications: Application[]
  jobs: Job[]
}

/** Staff (`cv.viewOwn`) CV scope: only CVs of JDs assigned to me (`Job.assigneeId === me`). */
function isApplicationInOwnScope(application: Application, ownJobIds: ReadonlySet<string>) {
  return ownJobIds.has(application.jobId)
}

function createMockSubject({ account, company, db }: MockContext): PermissionSubject {
  const member = db.members.find((item) => item.id === account.memberId)
  return { plan: company.plan, role: member?.role, status: member?.status ?? 'ACTIVE' }
}

/**
 * - `cv.viewAll` (Manager, FREE Owner): every JD / CV of the company.
 * - `cv.viewOwn` (Staff): JDs with `assigneeId === me` and the CVs of those JDs.
 * - Otherwise: Axios-shaped 403, like the backend.
 */
export async function loadMockScope(): Promise<MockScope> {
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
    const ownJobs = jobs.filter((job) => job.assigneeId === context.account.userId)
    const ownJobIds = new Set(ownJobs.map((job) => job.id))

    return {
      applications: applications.filter((application) => isApplicationInOwnScope(application, ownJobIds)),
      jobs: ownJobs,
    }
  }

  throw createForbiddenError()
}
