import { apiClient } from '../../lib/api'
import type { CompanyApplicationListResponse, RecruiterApplicationQuery } from '../../types/application.types'
import { mockApplicationsApi } from './mock/mockApplications'
import { shouldUseTeamMock } from './mock/mockMode'

/** Company-scoped applications (CV) with handler info. The backend (or mock) filters by visibility. */
export const teamApplicationsService = {
  async listApplications(params?: RecruiterApplicationQuery): Promise<CompanyApplicationListResponse> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockApplicationsApi.listApplications(params)
    }

    // Existing endpoint. TODO(BE): add handlerId to each application and enforce cv.viewOwn filtering.
    const response = await apiClient.get<CompanyApplicationListResponse>('/recruiter/applications', { params })
    return response.data
  },
}
