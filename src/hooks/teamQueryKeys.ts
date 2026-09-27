/** Stable React Query keys for the company RBAC data (plan keys live in companyPlanQueryKeys). */
export const teamQueryKeys = {
  all: ['team'] as const,
  me: (userId: string) => [...teamQueryKeys.all, 'me', userId] as const,
  invoices: (scope: string) => [...teamQueryKeys.all, 'invoices', scope] as const,
}
