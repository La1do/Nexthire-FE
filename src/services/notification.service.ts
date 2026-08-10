import { apiClient } from '../lib/api'
import type {
  NotificationCountEnvelope,
  NotificationEnvelope,
  NotificationListQuery,
  NotificationListResponse,
} from '../types/notification.types'

export const notificationService = {
  async list(query: NotificationListQuery = {}) {
    const response = await apiClient.get<NotificationListResponse>('/notifications', {
      params: query,
    })
    return response.data
  },

  async unreadCount() {
    const response = await apiClient.get<NotificationCountEnvelope>(
      '/notifications/unread-count',
    )
    return response.data.data.count
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch<NotificationEnvelope>(`/notifications/${id}/read`)
    return response.data.data
  },

  async markAllAsRead() {
    const response = await apiClient.patch<NotificationCountEnvelope>('/notifications/read-all')
    return response.data.data
  },
}
