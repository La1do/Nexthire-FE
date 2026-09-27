import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { teamCompanyService } from '../services/team/teamCompany.service'
import { companyPlanQueryKeys } from './companyPlanQueryKeys'

/**
 * Company plan of the current recruiter, via React Query.
 * The plan is intentionally NOT stored with the auth user in localStorage.
 * Disabled for non-recruiters / users without a company role.
 */
export function useCompanyPlan() {
  const { user } = useAuth()
  const scope = user?.companyId ?? user?.id ?? 'anonymous'
  const enabled = user?.role === 'RECRUITER' && Boolean(user.companyRole)

  return useQuery({
    enabled,
    queryFn: () => teamCompanyService.getCompanyPlan(),
    queryKey: companyPlanQueryKeys.detail(scope),
  })
}
