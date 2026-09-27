import { can } from '../../../lib/auth/permissions'
import type { AuditLog, AuditLogQuery } from '../../../types/auditLog.types'
import type { ListEnvelope } from '../../../types/job.types'
import { mockForbidden } from './mockErrors'
import { mockDelay, paginateMock, requireMockContext } from './mockStore'

/** Mock implementation of the company audit log (requires audit.view → PRO Owner). */
export const mockAuditLogApi = {
  async listAuditLogs(params: AuditLogQuery = {}): Promise<ListEnvelope<AuditLog>> {
    const { company, db, subject } = requireMockContext()

    if (!can(subject, 'audit.view').allowed) {
      throw mockForbidden('AUDIT.FORBIDDEN', 'You do not have access to the audit log.')
    }

    const logs = db.auditLogs
      .filter((log) => log.companyId === company.id && (!params.action || log.action === params.action))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

    return mockDelay(paginateMock(logs, params.page, params.limit))
  },
}
