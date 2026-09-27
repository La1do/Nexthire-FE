import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { teamCompanyService } from '../services/team/teamCompany.service'
import { teamQueryKeys } from './teamQueryKeys'

/** Invoice history of the current company (billing.manage; gate the UI with <Can permission="billing.manage">). */
export function useCompanyInvoices(options: { enabled?: boolean } = {}) {
  const { user } = useAuth()
  const scope = user?.companyId ?? user?.id ?? 'anonymous'

  return useQuery({
    enabled: (options.enabled ?? true) && user?.role === 'RECRUITER',
    queryFn: () => teamCompanyService.listInvoices(),
    queryKey: teamQueryKeys.invoices(scope),
  })
}
