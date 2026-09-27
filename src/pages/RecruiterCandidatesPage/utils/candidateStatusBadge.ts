import type { ApplicationStatus } from '../../../types/application.types'

/**
 * Maps API status values (uppercase) to the existing lowercase
 * `recruiter-application-status--*` badge modifiers (shared global badge styles).
 * CANCELLED has no styled modifier yet → base badge only.
 */
const STATUS_BADGE_MODIFIER: Record<ApplicationStatus, string | null> = {
  CANCELLED: null,
  OFFERED: 'offer',
  REJECTED: 'rejected',
  SUBMITTED: 'new',
}

export function getCandidateStatusBadgeClassName(status: ApplicationStatus) {
  const modifier = STATUS_BADGE_MODIFIER[status]
  return modifier ? `recruiter-application-status recruiter-application-status--${modifier}` : 'recruiter-application-status'
}
