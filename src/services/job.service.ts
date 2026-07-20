import { apiClient } from '../lib/api'
import type {
  Envelope,
  JobListQuery,
  ListEnvelope,
  PublicFeaturedCompany,
  PublicHomeStats,
  PublicJobDetail,
  PublicJobListItem,
  RecruiterJobListQuery,
  RecruiterJobResponse,
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
}
