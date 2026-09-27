import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamCompanyService } from '../services/team/teamCompany.service'
import type { CompanyPlan } from '../types/company.types'
import { companyPlanQueryKeys } from './companyPlanQueryKeys'
import { teamQueryKeys } from './teamQueryKeys'

/**
 * Upgrade / downgrade the current company (billing.manage).
 * On success: invalidates the plan and `me` queries first (permissions + member status), then every other
 * query, because a plan change touches members, job assignees and visibility.
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
