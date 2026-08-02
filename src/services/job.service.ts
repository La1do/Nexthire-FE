import { apiClient } from '../lib/api'
import type {
  CreateRecruiterJobPayload,
  DeleteRecruiterJobResponse,
  Envelope,
  JobActionReasonPayload,
  JobListQuery,
  ListEnvelope,
  PublicFeaturedCompany,
  PublicHomeStats,
  PublicJobDetail,
  PublicJobListItem,
  RecruiterJobListQuery,
  RecruiterJobResponse,
  RecruiterJobStatusCounts,
} from '../types/job.types'

export const jobService = {
  async getJobs(params?: JobListQuery) {
    const response = await apiClient.get<ListEnvelope<PublicJobListItem>>('/jobs', { params })
    return response.data
  },
  async getJobById(id: string) {
    const response = await apiClient.get<Envelope<PublicJobDetail>>(`/jobs/${id}`)
    return response.data.data
  },
  async getJobsByCompany(companyId: string, params?: JobListQuery) {
    const response = await apiClient.get<ListEnvelope<PublicJobListItem>>(
      `/jobs/companies/${companyId}`,
      { params },
    )
    return response.data
  },
  async getFeaturedCompanies(limit = 6) {
    const response = await apiClient.get<Envelope<PublicFeaturedCompany[]>>('/jobs/featured-companies', {
      params: { limit },
    })
    return response.data.data
  },
  async getHomeStats() {
    const response = await apiClient.get<Envelope<PublicHomeStats>>('/jobs/home/stats')
    return response.data.data
  },
  async getRecruiterJobs(params?: RecruiterJobListQuery) {
    const response = await apiClient.get<ListEnvelope<RecruiterJobResponse>>('/recruiter/jobs', { params })
    return response.data
  },
  async getRecruiterJobStatusCounts() {
    const response = await apiClient.get<Envelope<RecruiterJobStatusCounts>>('/recruiter/jobs/status-counts')
    return response.data.data
  },
  async getRecruiterJobById(id: string) {
    const response = await apiClient.get<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}`)
    return response.data.data
  },
  async createRecruiterJob(payload: CreateRecruiterJobPayload) {
    const response = await apiClient.post<Envelope<RecruiterJobResponse>>('/recruiter/jobs', payload)
    return response.data.data
  },
  async updateRecruiterJob(id: string, payload: CreateRecruiterJobPayload) {
    const response = await apiClient.patch<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}`, payload)
    return response.data.data
  },
  async submitRecruiterJob(id: string) {
    const response = await apiClient.post<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}/submit`)
    return response.data.data
  },
  async deleteRecruiterJob(id: string) {
    const response = await apiClient.delete<Envelope<DeleteRecruiterJobResponse>>(`/recruiter/jobs/${id}`)
    return response.data.data
  },
  async unpublishRecruiterJob(id: string, payload: JobActionReasonPayload = {}) {
    const response = await apiClient.post<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}/unpublish`, payload)
    return response.data.data
  },
  async republishRecruiterJob(id: string) {
    const response = await apiClient.post<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}/republish`)
    return response.data.data
  },
  async closeRecruiterJob(id: string, payload: JobActionReasonPayload = {}) {
    const response = await apiClient.post<Envelope<RecruiterJobResponse>>(`/recruiter/jobs/${id}/close`, payload)
    return response.data.data
  },
}
