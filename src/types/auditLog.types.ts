// Company RBAC (A0 contract): audit log entries visible to PRO Owners (audit.view).

export type AuditLogAction =
  | 'JD_SUBMITTED'
  | 'JD_APPROVED'
  | 'JD_REJECTED'
  | 'JD_PUBLISHED_BY_MANAGER'
  | 'JD_ASSIGNED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_ROLE_CHANGED'
  | 'PLAN_CHANGED'

export type AuditLogTargetType = 'JOB' | 'MEMBER' | 'COMPANY' | 'APPLICATION'

export type AuditLog = {
  id: string
  companyId: string
  actorId: string
  actorName: string
  action: AuditLogAction
  targetType: AuditLogTargetType
  targetId: string
  targetLabel: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export type AuditLogQuery = {
  page?: number
  limit?: number
  action?: AuditLogAction
}
