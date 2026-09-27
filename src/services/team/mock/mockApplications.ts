import { getApplicationVisibility } from '../../../lib/auth/permissions'
import type {
  Application,
  ApplicationResponse,
  CompanyApplicationListResponse,
  RecruiterApplicationListResponse,
  RecruiterApplicationQuery,
  RecruiterCandidateListResponse,
  RecruiterCandidateQuery,
  RecruiterCandidateResponse,
} from '../../../types/application.types'
import { mockForbidden, mockNotFound } from './mockErrors'
import { mockDelay, paginateMock, requireMockContext } from './mockStore'
import type { MockContext } from './mockStore'

/**
 * Applications of the current company visible to the current mock user (like the backend):
 * 'all' (cv.viewAll) → every company application; 'own' (cv.viewOwn) → the job is assigned to me
 * OR handlerId === me; 'none' (e.g. Owner PRO, suspended) → Axios-shaped 403.
 */
export function listVisibleMockApplications(context: MockContext = requireMockContext()): Application[] {
  const visibility = getApplicationVisibility(context.subject)

  if (visibility === 'none') {
    throw mockForbidden('APPLICATION.FORBIDDEN', 'You do not have access to applications.')
  }

  const myJobIds = new Set(
    context.db.jobs
      .filter((job) => job.companyId === context.company.id && job.assigneeId === context.userId)
      .map((job) => job.id),
  )

  return context.db.applications.filter(
    (application) =>
      application.companyId === context.company.id &&
      (visibility === 'all' || myJobIds.has(application.jobId) || application.handlerId === context.userId),
  )
}

/** One visible application or an Axios-shaped 404 / 403. */
export function findVisibleMockApplication(id: string, context: MockContext = requireMockContext()): Application {
  const application = context.db.applications.find(
    (item) => item.id === id && item.companyId === context.company.id,
  )

  if (!application) {
    throw mockNotFound('APPLICATION.NOT_FOUND', 'Application not found.')
  }

  if (!listVisibleMockApplications(context).some((item) => item.id === id)) {
    throw mockForbidden('APPLICATION.NOT_ASSIGNED', 'This application does not belong to your jobs.')
  }

  return application
}

function filterApplications(applications: Application[], params: RecruiterApplicationQuery) {
  const search = params.search?.trim().toLowerCase()
  return applications.filter(
    (application) =>
      (!params.jobId || application.jobId === params.jobId) &&
      (!params.status || application.status === params.status) &&
      (!params.matchLevel || application.matchLevel === params.matchLevel) &&
      (!search || application.candidateFullName.toLowerCase().includes(search)),
  )
}

function toLegacyApplication(application: Application): ApplicationResponse {
  const { handlerId: _handlerId, ...rest } = application
  return rest
}

function toCandidates(applications: Application[]): RecruiterCandidateResponse[] {
  const byCandidate = new Map<string, Application[]>()
  applications.forEach((application) => {
    byCandidate.set(application.candidateId, [...(byCandidate.get(application.candidateId) ?? []), application])
  })

  return [...byCandidate.values()].map((items) => {
    const latest = [...items].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0]
    const best = [...items].sort((left, right) => (right.matchScore ?? -1) - (left.matchScore ?? -1))[0]

    return {
      applicationCount: items.length,
      avatarDocumentId: latest.candidateAvatarDocumentId,
      avatarUrl: latest.candidateAvatarUrl,
      bestMatchLevel: best.matchLevel,
      bestMatchScore: best.matchScore,
      bestMatchedApplicationId: best.id,
      bestMatchedJobId: best.jobId,
      bestMatchedJobTitle: best.jobTitle,
      candidateId: latest.candidateId,
      candidateUserId: latest.candidateUserId,
      email: latest.candidateEmail,
      fullName: latest.candidateFullName,
      headline: null,
      lastAppliedAt: latest.submittedAt,
      latestApplicationId: latest.id,
      latestJobId: latest.jobId,
      latestJobTitle: latest.jobTitle,
      latestStatus: latest.status,
      location: null,
      phone: latest.candidatePhone,
      skills: [],
    }
  })
}

/** Mock implementation of the company-scoped application endpoints. */
export const mockApplicationsApi = {
  async listApplications(params: RecruiterApplicationQuery = {}): Promise<CompanyApplicationListResponse> {
    return mockDelay(
      paginateMock(filterApplications(listVisibleMockApplications(), params), params.page, params.limit),
    )
  },

  // --- Legacy endpoints used by the existing recruiter pages (applicationService) in a mock session ---

  async listLegacyRecruiterApplications(params: RecruiterApplicationQuery = {}): Promise<RecruiterApplicationListResponse> {
    const applications = filterApplications(listVisibleMockApplications(), params).map(toLegacyApplication)
    return mockDelay(paginateMock(applications, params.page, params.limit))
  },

  async getLegacyRecruiterApplication(id: string): Promise<ApplicationResponse> {
    return mockDelay(toLegacyApplication(findVisibleMockApplication(id)))
  },

  async listLegacyRecruiterCandidates(params: RecruiterCandidateQuery = {}): Promise<RecruiterCandidateListResponse> {
    const search = params.search?.trim().toLowerCase()
    const candidates = toCandidates(
      listVisibleMockApplications().filter(
        (application) =>
          (!params.jobId || application.jobId === params.jobId) &&
          (!params.status || application.status === params.status),
      ),
    ).filter((candidate) => !search || candidate.fullName.toLowerCase().includes(search))

    return mockDelay(paginateMock(candidates, params.page, params.limit))
  },
}
