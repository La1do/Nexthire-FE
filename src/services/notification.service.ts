import { apiClient } from '../lib/api'
import type {
  NotificationCountEnvelope,
  NotificationEnvelope,
  NotificationListQuery,
  NotificationListResponse,
} from '../types/notification.types'
import { shouldUseTeamMock } from './team/mock/mockMode'

export const notificationService = {
  async list(query: NotificationListQuery = {}): Promise<NotificationListResponse> {
    // Dev mock session: no notifications (mock tokens never reach the backend).
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return { data: [], meta: { limit: query.limit ?? 20, page: 1, total: 0, totalPages: 1 }, success: true }
    }

    const response = await apiClient.get<NotificationListResponse>('/notifications', {
      params: query,
    })
    return response.data
  },

  async unreadCount(): Promise<number> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return 0
    }

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
