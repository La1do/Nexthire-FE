import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamCompanyService } from '../services/team/teamCompany.service'
import type { CompanyPlan } from '../types/company.types'
import { companyPlanQueryKeys } from './companyPlanQueryKeys'
import { teamQueryKeys } from './teamQueryKeys'

/**
 * Upgrade / downgrade the current company (billing.manage).
 * On success, immediately: invalidates (and refetches if mounted) the plan and team queries first
 * (`me` → member status, invoices), then EVERY query (members, jobs, applications, audit log, …), because
 * a plan change touches members, job assignees and visibility. Invalidation bypasses staleTime
 * (e.g. useTeamMe's 60 s), so nothing waits for the cache to expire.
 */
export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (plan: CompanyPlan) => teamCompanyService.changePlan(plan),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: companyPlanQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.all }),
      ])
      await queryClient.invalidateQueries()
    },
  })
}
