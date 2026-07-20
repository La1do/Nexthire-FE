import { apiClient } from '../lib/api'
import type {
  ApplicationResponse,
  RecruiterApplicationListResponse,
  RecruiterApplicationQuery,
} from '../types/application.types'
import type { Envelope } from '../types/job.types'

export const applicationService = {
  async getRecruiterApplications(params?: RecruiterApplicationQuery) {
    const response = await apiClient.get<RecruiterApplicationListResponse>('/recruiter/applications', { params })
    return response.data
  },
  async getRecruiterApplication(id: string) {
    const response = await apiClient.get<Envelope<ApplicationResponse>>(`/recruiter/applications/${id}`)
    return response.data.data
  },
}
