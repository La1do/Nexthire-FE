import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context'
import { notificationService } from '../services/notification.service'
import type { NotificationListQuery } from '../types/notification.types'
import { notificationQueryKeys } from './notificationQueryKeys'

type UseNotificationsOptions = {
  enabled?: boolean
  listEnabled?: boolean
  listQuery?: NotificationListQuery
}

const DEFAULT_LIST_QUERY: NotificationListQuery = {
  limit: 8,
  page: 1,
  readStatus: 'ALL',
}

function getNotificationScopeKey(user: ReturnType<typeof useAuth>['user']) {
  if (!user) {
    return 'anonymous'
  }
  return user.role === 'RECRUITER' && user.companyId
    ? `company:${user.companyId}`
    : `user:${user.id}`
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true, listEnabled = enabled, listQuery = DEFAULT_LIST_QUERY } = options
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const scopeKey = getNotificationScopeKey(user)
  const canFetch = enabled && isAuthenticated && (user?.role === 'CANDIDATE' || user?.role === 'RECRUITER')
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.scope(scopeKey) })

  const list = useQuery({
    enabled: canFetch && listEnabled,
    placeholderData: keepPreviousData,
    queryFn: () => notificationService.list(listQuery),
    queryKey: notificationQueryKeys.list(scopeKey, listQuery),
  })

  const unread = useQuery({
    enabled: canFetch,
    queryFn: notificationService.unreadCount,
    queryKey: notificationQueryKeys.unread(scopeKey),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  const markRead = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: invalidate,
  })

  const markAll = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: invalidate,
  })

  return { canFetch, list, markAll, markRead, unread }
}
