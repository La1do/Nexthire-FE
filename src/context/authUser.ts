import type { AuthUser } from '../services/auth.service'
import { getUserInitials } from '../pages/_utils/userAvatar'

export function getAuthUserDisplayName(user: AuthUser): string {
  return user.fullName?.trim() || user.companyName?.trim() || user.email
}

export function getInitials(value: string): string {
  return getUserInitials(value)
}
