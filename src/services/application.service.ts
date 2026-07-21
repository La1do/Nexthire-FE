import { apiClient } from '../lib/api'
import type {
  ApplicationCvDownloadResponse,
  ApplicationResponse,
  CandidateApplicationListResponse,
  CandidateApplicationQuery,
  RecruiterApplicationListResponse,
  RecruiterApplicationQuery,
} from '../types/application.types'
import type { Envelope } from '../types/job.types'

export const applicationService = {
  async getMyApplications(params?: CandidateApplicationQuery) {
    const response = await apiClient.get<CandidateApplicationListResponse>('/applications/me', { params })
    return response.data
  },
  async getMyApplication(id: string) {
    const response = await apiClient.get<Envelope<ApplicationResponse>>(`/applications/me/${id}`)
    return response.data.data
  },
  async getMyApplicationCv(id: string) {
    const response = await apiClient.get<Envelope<ApplicationCvDownloadResponse>>(`/applications/me/${id}/cv`)
    return response.data.data
  },
  async withdrawMyApplication(id: string, note?: string) {
    const response = await apiClient.post<Envelope<ApplicationResponse>>(`/applications/me/${id}/withdraw`, {
      note,
    })
    return response.data.data
  },
  async getRecruiterApplications(params?: RecruiterApplicationQuery) {
    const response = await apiClient.get<RecruiterApplicationListResponse>('/recruiter/applications', { params })
    return response.data
  },
  async getRecruiterApplication(id: string) {
    const response = await apiClient.get<Envelope<ApplicationResponse>>(`/recruiter/applications/${id}`)
    return response.data.data
  },
}
