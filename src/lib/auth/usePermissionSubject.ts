import { useAuth } from '../../context/useAuth'
import { useCompanyPlan } from '../../hooks/useCompanyPlan'
import { buildPermissionSubject } from './permissions'
import type { PermissionSubject } from './permissions'

/**
 * The permission subject of the current user, or UNKNOWN while the company plan is loading / failed.
 * Unknown is never interpreted as FREE: gates and the menu must show a loading state, or an error with Retry.
 */
export type PermissionSubjectState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; subject: PermissionSubject }

export function usePermissionSubject(): PermissionSubjectState {
  const { user } = useAuth()
  const planQuery = useCompanyPlan()
  const plan = planQuery.data?.plan

  if (planQuery.isLoading) {
    return { status: 'loading' }
  }

  // A failed background refetch keeps the last known plan; only a failure without a plan is "unknown".
  if (!plan && planQuery.isError) {
    return {
      retry: () => {
        void planQuery.refetch()
      },
      status: 'error',
    }
  }

  // Query disabled (not a recruiter) → no company role → can() denies with reason 'role' before using the plan.
  return { status: 'ready', subject: buildPermissionSubject(user, plan ?? 'FREE') }
}
