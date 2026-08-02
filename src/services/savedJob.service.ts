import { apiClient } from '../lib/api'
import type {
  DeleteSavedJobEnvelope,
  SavedJobBatchStatusEnvelope,
  SavedJobEnvelope,
  SavedJobListQuery,
  SavedJobListResponse,
  SavedJobSingleStatusEnvelope,
} from '../types/savedJob.types'

export const savedJobService = {
  async list(query: SavedJobListQuery = {}) {
    const response = await apiClient.get<SavedJobListResponse>('/saved-jobs', { params: query })
    return response.data
  },

  async save(jobId: string) {
    const response = await apiClient.post<SavedJobEnvelope>(`/saved-jobs/${jobId}`)
    return response.data.data
  },

  async remove(jobId: string) {
    const response = await apiClient.delete<DeleteSavedJobEnvelope>(`/saved-jobs/${jobId}`)
    return response.data.data
  },

  async batchStatus(jobIds: ReadonlyArray<string>) {
    const response = await apiClient.get<SavedJobBatchStatusEnvelope>('/saved-jobs/status', {
      params: { jobIds: jobIds.join(',') },
    })
    return response.data.data
  },

  async singleStatus(jobId: string) {
    const response = await apiClient.get<SavedJobSingleStatusEnvelope>(
      `/saved-jobs/${jobId}/status`,
    )
    return response.data.data
  },
}
