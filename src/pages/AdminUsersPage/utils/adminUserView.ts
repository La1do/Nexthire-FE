import type { AdminUser as AdminApiUser } from '../../../types/admin.types'
import type { AdminUser } from '../types'

export function toAdminUserView(user: AdminApiUser): AdminUser {
  return {
    ...user,
    name: user.fullName?.trim() || user.email,
    primaryRole: user.roles[0] ?? 'CANDIDATE',
  }
}

export function formatAdminDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
