import { apiClient } from '../../lib/api'
import type { AuditLog, AuditLogQuery } from '../../types/auditLog.types'
import type { ListEnvelope } from '../../types/job.types'
import { isTeamMockEnabled } from './mock/mockMode'
import { mockDelay, paginateMock, requireMockContext } from './mock/mockStore'

const mockTeamAuditLogService = {
  async listAuditLogs(params: AuditLogQuery = {}): Promise<ListEnvelope<AuditLog>> {
    const { company, db } = requireMockContext()
    const logs = db.auditLogs
      .filter((log) => log.companyId === company.id && (!params.action || log.action === params.action))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

    return mockDelay(paginateMock(logs, params.page, params.limit))
  },
}

const realTeamAuditLogService = {
  async listAuditLogs(params?: AuditLogQuery): Promise<ListEnvelope<AuditLog>> {
    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<ListEnvelope<AuditLog>>('/companies/me/audit-logs', { params })
    return response.data
  },
}

/** Company audit log (PRO Owner, permission `audit.view`). */
export const teamAuditLogService: {
  listAuditLogs: (params?: AuditLogQuery) => Promise<ListEnvelope<AuditLog>>
} = isTeamMockEnabled ? mockTeamAuditLogService : realTeamAuditLogService
