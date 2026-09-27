/**
 * Stable React Query keys for the company plan. Invalidate `companyPlanQueryKeys.all`
 * after an upgrade/downgrade (A1) so every usePermission() re-evaluates.
 */
export const companyPlanQueryKeys = {
  all: ['company', 'plan'] as const,
  detail: (scope: string) => [...companyPlanQueryKeys.all, scope] as const,
}
