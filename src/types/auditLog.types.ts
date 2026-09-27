// Company RBAC (A0 contract): audit log entries visible to PRO Owners (audit.view).
import type { CompanyPlan, CompanyRole } from './company.types'

export type AuditLogTargetType = 'JOB' | 'MEMBER' | 'COMPANY' | 'APPLICATION'

/** Metadata payload per action. Actions mapped to `undefined` carry no metadata. */
export type AuditLogMetadataByAction = {
  JD_SUBMITTED: undefined
  JD_APPROVED: undefined
  /** Internal return to Staff (status 'RETURNED'). */
  JD_RETURNED: { returnReason: string }
  JD_PUBLISHED_BY_MANAGER: undefined
  JD_ASSIGNED: {
    fromAssigneeId: string | null
    toAssigneeId: string | null
    fromAssigneeName?: string | null
    toAssigneeName?: string | null
  }
  MEMBER_ADDED: { role: CompanyRole }
  MEMBER_REMOVED: undefined
  MEMBER_ROLE_CHANGED: { fromRole: CompanyRole; toRole: CompanyRole }
  PLAN_CHANGED: { fromPlan: CompanyPlan; toPlan: CompanyPlan }
}

/** Exactly 9 actions. */
export type AuditLogAction = keyof AuditLogMetadataByAction

type AuditLogBase = {
  id: string
  companyId: string
  actorId: string
  actorName: string
  targetType: AuditLogTargetType
  targetId: string
  targetLabel: string
  createdAt: string
}

/** Discriminated union on `action`; `metadata` is typed per action (absent when the action has none). */
export type AuditLog = {
  [TAction in AuditLogAction]: AuditLogBase &
    (AuditLogMetadataByAction[TAction] extends undefined
      ? { action: TAction; metadata?: undefined }
      : { action: TAction; metadata: AuditLogMetadataByAction[TAction] })
}[AuditLogAction]

export type AuditLogQuery = {
  page?: number
  limit?: number
  action?: AuditLogAction
}
