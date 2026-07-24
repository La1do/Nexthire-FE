import { apiClient } from '../lib/api'
import type {
  CandidateCvResponse,
  CandidateMeResponse,
  CandidateUpdatePayload,
} from '../types/candidate.types'
import type { Envelope } from '../types/job.types'

export const candidateService = {
  async getMyProfile() {
    const response = await apiClient.get<Envelope<CandidateMeResponse>>('/candidates/me')
    return response.data.data
  },
  async updateMyProfile(payload: CandidateUpdatePayload) {
    const response = await apiClient.patch<Envelope<CandidateMeResponse>>('/candidates/me', payload)
    return response.data.data
  },
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.patch<Envelope<CandidateMeResponse>>('/candidates/me/avatar', formData)
    return response.data.data
  },
  async uploadCv(file: File, options?: { isDefault?: boolean; parse?: boolean; title?: string }) {
    const formData = new FormData()
    formData.append('file', file)

    if (options?.title) {
      formData.append('title', options.title)
    }

    if (options?.isDefault !== undefined) {
      formData.append('isDefault', String(options.isDefault))
    }

    if (options?.parse !== undefined) {
      formData.append('parse', String(options.parse))
    }

    const response = await apiClient.post<Envelope<CandidateCvResponse>>('/cvs/upload', formData)
    return response.data.data
  },
  async parseCv(id: string) {
    const response = await apiClient.post<Envelope<CandidateCvResponse>>(`/cvs/${id}/parse`)
    return response.data.data
  },
  async deleteCv(id: string) {
    const response = await apiClient.delete<Envelope<{ deleted: true }>>(`/cvs/${id}`)
    return response.data.data
  },
}
