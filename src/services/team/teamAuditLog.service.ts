import { apiClient } from '../../lib/api'
import type { AuditLog, AuditLogQuery } from '../../types/auditLog.types'
import type { ListEnvelope } from '../../types/job.types'
import { mockAuditLogApi } from './mock/mockAuditLog'
import { shouldUseTeamMock } from './mock/mockMode'

/** Company audit log (PRO Owner, permission `audit.view`). */
export const teamAuditLogService = {
  async listAuditLogs(params?: AuditLogQuery): Promise<ListEnvelope<AuditLog>> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockAuditLogApi.listAuditLogs(params)
    }

    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<ListEnvelope<AuditLog>>('/companies/me/audit-logs', { params })
    return response.data
  },
}
