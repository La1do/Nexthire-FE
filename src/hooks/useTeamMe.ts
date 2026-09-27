import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { teamAuthService } from '../services/team/teamAuth.service'
import type { TeamAuthProfile } from '../services/team/teamAuth.types'
import { teamQueryKeys } from './teamQueryKeys'

/**
 * Fresh GET /auth/me for the recruiter area. `companyRole` / `companyMemberStatus` are persisted with the
 * auth user in localStorage and can be stale (role change, downgrade), so the recruiter layout refetches
 * this whenever it mounts (staleTime 0) and syncs the RBAC fields back into the auth user.
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
    staleTime: 0,
  })
}
