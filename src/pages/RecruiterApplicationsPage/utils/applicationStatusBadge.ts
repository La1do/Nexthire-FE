import type { RecruiterApplicationStatus } from '../types'

/**
 * Maps API status values (uppercase) to the existing lowercase badge modifiers
 * in recruiter-applications.css. CANCELLED has no styled modifier yet → base badge only.
 */
const STATUS_BADGE_MODIFIER: Record<RecruiterApplicationStatus, string | null> = {
  CANCELLED: null,
  OFFERED: 'offer',
  REJECTED: 'rejected',
  SUBMITTED: 'new',
}

export function getApplicationStatusBadgeClassName(status: RecruiterApplicationStatus) {
  const modifier = STATUS_BADGE_MODIFIER[status]
  return modifier ? `recruiter-application-status recruiter-application-status--${modifier}` : 'recruiter-application-status'
}
