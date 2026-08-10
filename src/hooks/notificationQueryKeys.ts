import type { NotificationListQuery } from '../types/notification.types'

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  scope: (scopeKey: string) => [...notificationQueryKeys.all, scopeKey] as const,
  lists: (scopeKey: string) => [...notificationQueryKeys.scope(scopeKey), 'list'] as const,
  list: (scopeKey: string, query: NotificationListQuery) =>
    [...notificationQueryKeys.lists(scopeKey), query] as const,
  unread: (scopeKey: string) => [...notificationQueryKeys.scope(scopeKey), 'unread'] as const,
}
