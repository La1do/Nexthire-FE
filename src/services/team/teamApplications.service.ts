import { apiClient } from '../../lib/api'
import type { CompanyApplicationListResponse, RecruiterApplicationQuery } from '../../types/application.types'
import { isTeamMockEnabled } from './mock/mockMode'
import { mockDelay, paginateMock, requireMockContext } from './mock/mockStore'

const mockTeamApplicationsService = {
  async listApplications(params: RecruiterApplicationQuery = {}): Promise<CompanyApplicationListResponse> {
    const { company, db } = requireMockContext()
    // A0: company scope + simple filters only. TODO(A1): filter by handlerId for STAFF (cv.viewOwn), like the BE.
    const search = params.search?.trim().toLowerCase()
    const applications = db.applications.filter(
      (application) =>
        application.companyId === company.id &&
        (!params.jobId || application.jobId === params.jobId) &&
        (!params.status || application.status === params.status) &&
        (!search || application.candidateFullName.toLowerCase().includes(search)),
    )

    return mockDelay(paginateMock(applications, params.page, params.limit))
  },
}

const realTeamApplicationsService = {
  async listApplications(params?: RecruiterApplicationQuery): Promise<CompanyApplicationListResponse> {
    // Existing endpoint. TODO(BE): add handlerId to each application.
    const response = await apiClient.get<CompanyApplicationListResponse>('/recruiter/applications', { params })
    return response.data
  },
}

/** Company-scoped applications (CV) with handler info. */
export const teamApplicationsService: {
  listApplications: (params?: RecruiterApplicationQuery) => Promise<CompanyApplicationListResponse>
} = isTeamMockEnabled ? mockTeamApplicationsService : realTeamApplicationsService
