import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminNotificationsService } from '../services/admin'
import { adminQueryKeys } from './adminQueryKeys'

export function useAdminNotifications(enabled: boolean) {
  const queryClient = useQueryClient()
  const list = useQuery({ queryKey: adminQueryKeys.notificationList(), queryFn: adminNotificationsService.list, enabled })
  const unread = useQuery({ queryKey: adminQueryKeys.notificationUnread(), queryFn: adminNotificationsService.unreadCount, refetchInterval: 60_000, refetchOnWindowFocus: true })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications() })
  const markRead = useMutation({ mutationFn: adminNotificationsService.markAsRead, onSuccess: invalidate })
  const markAll = useMutation({ mutationFn: adminNotificationsService.markAllAsRead, onSuccess: invalidate })
  return { list, markAll, markRead, unread }
}
