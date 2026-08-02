import { apiClient } from '../../lib/api'
import type { ApiSuccessEnvelope, PaginatedEnvelope } from '../../types/admin.types'

export type AdminNotificationType = 'ADMIN_COMPANY_REVIEW_REQUIRED' | 'ADMIN_JOB_REVIEW_REQUIRED' | 'ADMIN_JOB_REVISION_REVIEW_REQUIRED' | 'ADMIN_USER_RISK_DETECTED' | 'ADMIN_SYSTEM_ALERT'
export type AdminNotification = {
  id: string; type: AdminNotificationType; title: string; body: string; readAt: string | null
  createdAt: string; data?: { companyId?: string; jobId?: string; revisionId?: string; userId?: string }
}

export const adminNotificationsService = {
  async list() {
    const response = await apiClient.get<PaginatedEnvelope<AdminNotification>>('/notifications', { params: { page: 1, limit: 8, readStatus: 'ALL' } })
    return { data: response.data.data, meta: response.data.meta }
  },
  async unreadCount() {
    const response = await apiClient.get<ApiSuccessEnvelope<{ count: number }>>('/notifications/unread-count')
    return response.data.data.count
  },
  async markAsRead(id: string) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminNotification>>(`/notifications/${id}/read`)
    return response.data.data
  },
  async markAllAsRead() {
    const response = await apiClient.patch<ApiSuccessEnvelope<{ count: number }>>('/notifications/read-all')
    return response.data.data
  },
}
