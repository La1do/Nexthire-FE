import { apiClient } from '../lib/api'
import type {
  ApplicationCvDownloadResponse,
  ApplicationResponse,
  CandidateApplicationListResponse,
  CandidateApplicationQuery,
  CreateApplicationPayload,
  RecruiterApplicationMatchResponse,
  RecruiterApplicationListResponse,
  RecruiterApplicationQuery,
  UpdateRecruiterApplicationStatusPayload,
} from '../types/application.types'
import type { Envelope } from '../types/job.types'

export const applicationService = {
  async apply(payload: CreateApplicationPayload) {
    const response = await apiClient.post<Envelope<ApplicationResponse>>('/applications', payload)
    return response.data.data
  },
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
  async getRecruiterApplicationCv(id: string) {
    const response = await apiClient.get<Envelope<ApplicationCvDownloadResponse>>(`/recruiter/applications/${id}/cv`)
    return response.data.data
  },
  async runRecruiterApplicationMatch(id: string) {
    const response = await apiClient.post<Envelope<RecruiterApplicationMatchResponse>>(
      `/recruiter/applications/${id}/match`,
    )
    return response.data.data
  },
  async updateRecruiterApplicationStatus(id: string, payload: UpdateRecruiterApplicationStatusPayload) {
    const response = await apiClient.patch<Envelope<ApplicationResponse>>(
      `/recruiter/applications/${id}/status`,
      payload,
    )
    return response.data.data
  },
}
