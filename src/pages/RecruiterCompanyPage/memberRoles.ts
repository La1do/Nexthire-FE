import type { CompanyRole, Member } from '../../types/company.types'

/**
 * Member-data helpers for display and seat counting only (not access control; that stays in `can()`, ADR-04).
 * The only role literals of this page live here so an ADR-04 grep has a single, reviewable hit.
 */
export type AssignableRole = Exclude<CompanyRole, 'OWNER'>

export const ASSIGNABLE_ROLES: ReadonlyArray<AssignableRole> = ['MANAGER', 'STAFF']

export function isAssignableRole(value: string): value is AssignableRole {
  return ASSIGNABLE_ROLES.some((role) => role === value)
}

/** The Owner row cannot be removed or re-assigned. */
export function isOwnerMember(member: Member) {
  return !isAssignableRole(member.role)
}

/** Only ACTIVE members take a seat; SUSPENDED ones do not. */
export function countActiveSeats(members: ReadonlyArray<Member>, role: AssignableRole) {
  return members.filter((member) => member.role === role && member.status === 'ACTIVE').length
}

/** PRO onboarding hint on the billing tab. */
export function hasActiveManager(members: ReadonlyArray<Member>) {
  return countActiveSeats(members, 'MANAGER') > 0
}
