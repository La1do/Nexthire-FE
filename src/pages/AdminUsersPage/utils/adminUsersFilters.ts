import type { AdminUser, AdminUserCriteria } from '../types'

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase()
}

export function filterAdminUsers(
  users: ReadonlyArray<AdminUser>,
  criteria: AdminUserCriteria,
): AdminUser[] {
  const query = normalizeQuery(criteria.query)
  const roleFilter = criteria.role
  const statusFilter = criteria.status

  return users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false
    }

    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = `${user.name} ${user.email}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function isActiveFilters(criteria: AdminUserCriteria): boolean {
  return (
    normalizeQuery(criteria.query).length > 0 ||
    criteria.role !== 'all' ||
    criteria.status !== 'all'
  )
}
