import { apiClient } from '../../lib/api'
import type {
  AdminReasonPayload,
  AdminUser,
  AdminUserListQuery,
  AdminUserOverview,
  ApiSuccessEnvelope,
  PaginatedEnvelope,
} from '../../types/admin.types'

export const adminUsersService = {
  async list(query: AdminUserListQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminUser>>('/admin/users', {
      params: query,
    })
    return response.data
  },

  async getById(userId: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminUser>>(`/admin/users/${userId}`)
    return response.data.data
  },

  async getOverview() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminUserOverview>>(
      '/admin/users/overview',
    )
    return response.data.data
  },

  async suspend(userId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminUser>>(
      `/admin/users/${userId}/suspend`,
      payload,
    )
    return response.data.data
  },

  async ban(userId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminUser>>(
      `/admin/users/${userId}/ban`,
      payload,
    )
    return response.data.data
  },

  async archive(userId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminUser>>(
      `/admin/users/${userId}/archive`,
      payload,
    )
    return response.data.data
  },

  async restore(userId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminUser>>(
      `/admin/users/${userId}/restore`,
      payload,
    )
    return response.data.data
  },
}
