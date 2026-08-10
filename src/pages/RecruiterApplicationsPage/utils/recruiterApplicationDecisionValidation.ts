import type { RecruiterApplicationStatus } from '../types'

export type RecruiterDecisionStatus = Extract<RecruiterApplicationStatus, 'OFFERED' | 'REJECTED'>

export const APPLICATION_FEEDBACK_MAX_LENGTH = 2000
export const REJECTION_FEEDBACK_MIN_LENGTH = 10

export function validateApplicationFeedback(status: RecruiterDecisionStatus, feedback: string) {
  const normalizedFeedback = feedback.trim()

  if (normalizedFeedback.length > APPLICATION_FEEDBACK_MAX_LENGTH) {
    return 'maxLength' as const
  }

  if (status === 'REJECTED' && normalizedFeedback.length < REJECTION_FEEDBACK_MIN_LENGTH) {
    return 'rejectionRequired' as const
  }

  return null
}
