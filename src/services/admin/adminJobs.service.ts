import { apiClient } from '../../lib/api'
import type {
  AdminJob,
  AdminJobListQuery,
  AdminJobOverview,
  AdminJobReviewQueueQuery,
  AdminJobRevision,
  AdminRevisionReviewQueueQuery,
  ApiSuccessEnvelope,
  JobReasonPayload,
  PaginatedEnvelope,
  ReviewDecisionPayload,
} from '../../types/admin.types'

export const adminJobsService = {
  async list(query: AdminJobListQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminJob>>('/admin/jobs', {
      params: query,
    })
    return response.data
  },

  async getOverview() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminJobOverview>>(
      '/admin/jobs/overview',
    )
    return response.data.data
  },

  async getDetail(jobId: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminJob>>(
      `/admin/jobs/${jobId}`,
    )
    return response.data.data
  },

  async listReviewQueue(query: AdminJobReviewQueueQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminJob>>(
      '/admin/jobs/review-queue',
      { params: query },
    )
    return response.data
  },

  async review(jobId: string, payload: ReviewDecisionPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminJob>>(
      `/admin/jobs/${jobId}/review`,
      payload,
    )
    return response.data.data
  },

  async unpublish(jobId: string, payload: JobReasonPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminJob>>(
      `/admin/jobs/${jobId}/unpublish`,
      payload,
    )
    return response.data.data
  },

  async republish(jobId: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminJob>>(
      `/admin/jobs/${jobId}/republish`,
    )
    return response.data.data
  },

  async close(jobId: string, payload: JobReasonPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminJob>>(
      `/admin/jobs/${jobId}/close`,
      payload,
    )
    return response.data.data
  },

  async listRevisionReviewQueue(query: AdminRevisionReviewQueueQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminJobRevision>>(
      '/admin/jobs/revision-review-queue',
      { params: query },
    )
    return response.data
  },

  async reviewRevision(revisionId: string, payload: ReviewDecisionPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminJobRevision>>(
      `/admin/jobs/revisions/${revisionId}/review`,
      payload,
    )
    return response.data.data
  },

  async getRevisionDetail(revisionId: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminJobRevision>>(
      `/admin/jobs/revisions/${revisionId}`,
    )
    return response.data.data
  },
}
