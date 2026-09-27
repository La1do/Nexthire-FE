import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/useAuth'
import { teamAuditLogService, teamCompanyService } from '../../services/team'

/** Page-local query keys. TODO(A1): switch to `teamQueryKeys` once A1 is merged. */
export const companyWorkspaceQueryKeys = {
  all: ['company', 'workspace'] as const,
  auditLogs: (scope: string) => [...companyWorkspaceQueryKeys.all, 'audit-logs', scope] as const,
  members: (scope: string) => [...companyWorkspaceQueryKeys.all, 'members', scope] as const,
}

/** Enough rows for the activity tab until the audit log gets server-side filters and paging in the UI. */
export const COMPANY_AUDIT_LOG_LIMIT = 50

function useCompanyScope() {
  const { user } = useAuth()
  return user?.companyId ?? user?.id ?? 'anonymous'
}

/** Company members. Callers pass `enabled` from the permission result so blocked roles never fetch. */
export function useCompanyMembers(enabled: boolean) {
  const scope = useCompanyScope()

  return useQuery({
    enabled,
    queryFn: () => teamCompanyService.listMembers(),
    queryKey: companyWorkspaceQueryKeys.members(scope),
  })
}

/** Latest company audit log entries (`audit.view`). */
export function useCompanyAuditLogs(enabled: boolean) {
  const scope = useCompanyScope()

  return useQuery({
    enabled,
    queryFn: () => teamAuditLogService.listAuditLogs({ limit: COMPANY_AUDIT_LOG_LIMIT, page: 1 }),
    queryKey: companyWorkspaceQueryKeys.auditLogs(scope),
  })
}
