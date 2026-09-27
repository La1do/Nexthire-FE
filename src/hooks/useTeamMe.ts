import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { teamAuthService } from '../services/team/teamAuth.service'
import type { TeamAuthProfile } from '../services/team/teamAuth.types'
import { teamQueryKeys } from './teamQueryKeys'

/**
 * Fresh GET /auth/me for the recruiter area. `companyRole` / `companyMemberStatus` are persisted with the
 * auth user in localStorage and can be stale (role change, downgrade), so the recruiter layout refetches
 * this on mount when the cached value is older than 60 s (staleTime) and syncs the RBAC fields back into the
 * auth user. useChangePlan invalidates it right after every plan change, so status changes show immediately.
 */
export function useTeamMe() {
  const { updateUser, user } = useAuth()
  const userId = user?.id ?? 'anonymous'

  return useQuery<TeamAuthProfile>({
    enabled: user?.role === 'RECRUITER',
    queryFn: async () => {
      const me = await teamAuthService.getMe()
      const patch = Object.fromEntries(
        Object.entries({
          companyId: me.companyId,
          companyMemberStatus: me.companyMemberStatus,
          companyName: me.companyName,
          companyRole: me.companyRole,
        }).filter(([, value]) => value !== undefined),
      )
      updateUser(patch)
      return me
    },
    queryKey: teamQueryKeys.me(userId),
    // Refetched on entering the recruiter area when older than 60 s; plan changes invalidate it immediately (useChangePlan).
    staleTime: 60_000,
  })
}
