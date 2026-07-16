import type { AuthUser } from '../services/auth.service'

export function getAuthUserDisplayName(user: AuthUser): string {
  return user.fullName?.trim() || user.companyName?.trim() || user.email
}

export function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
