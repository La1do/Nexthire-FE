import { useAuth } from '../../context/useAuth'
import { useCompanyPlan } from '../../hooks/useCompanyPlan'
import { can } from './permissions'
import type { Permission, PermissionResult, PermissionSubject } from './permissions'

/**
 * - Plan known → the `can()` result (`isLoading: false`, `isError: false`).
 * - Plan loading, or plan query failed with no cached plan → UNKNOWN: `allowed: false` with NO `reason`.
 *   Callers must show a loading / error state, never a locked state or an upgrade button.
 */
export type UsePermissionResult =
  | (PermissionResult & { isLoading: false; isError: false })
  | { allowed: false; reason?: undefined; isLoading: true; isError: false }
  | { allowed: false; reason?: undefined; isLoading: false; isError: true }

/**
 * Permission check for the current user. Only builds the subject
 * (companyRole + companyMemberStatus from the auth user, plan from React Query)
 * and delegates to `can()` — no permission logic lives here.
 */
export function usePermission(permission: Permission): UsePermissionResult {
  const { user } = useAuth()
  const planQuery = useCompanyPlan()
  const plan = planQuery.data?.plan

  if (planQuery.isLoading) {
    return { allowed: false, isError: false, isLoading: true }
  }

  // A failed background refetch keeps the last known plan; only a failure without a plan is "unknown".
  if (!plan && planQuery.isError) {
    return { allowed: false, isError: true, isLoading: false }
  }

  const subject: PermissionSubject = {
    // Query disabled (no company role) → plan never fetched; can() denies with reason 'role' before using it.
    plan: plan ?? 'FREE',
    role: user?.companyRole,
    status: user?.companyMemberStatus ?? 'ACTIVE',
  }
  const result: PermissionResult = can(subject, permission)

  return { ...result, isError: false, isLoading: false }
}
