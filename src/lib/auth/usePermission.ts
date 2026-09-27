import { useAuth } from '../../context/useAuth'
import { useCompanyPlan } from '../../hooks/useCompanyPlan'
import { can } from './permissions'
import type { Permission, PermissionResult, PermissionSubject } from './permissions'

export type UsePermissionResult = PermissionResult & {
  /** True while the company plan is being fetched for the first time. */
  isLoading: boolean
}

/**
 * Permission check for the current user. Only builds the subject
 * (companyRole + companyMemberStatus from the auth user, plan from React Query)
 * and delegates to `can()` — no permission logic lives here.
 * While the plan is unknown the most restrictive plan ('FREE') is used; check `isLoading` to avoid flashes.
 */
export function usePermission(permission: Permission): UsePermissionResult {
  const { user } = useAuth()
  const planQuery = useCompanyPlan()

  const subject: PermissionSubject = {
    plan: planQuery.data?.plan ?? 'FREE',
    role: user?.companyRole,
    status: user?.companyMemberStatus ?? 'ACTIVE',
  }

  return { ...can(subject, permission), isLoading: planQuery.isLoading }
}
