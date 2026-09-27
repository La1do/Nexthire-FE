/**
 * Company RBAC — the ONLY place where company roles and plans are compared.
 *
 * UI code must never compare `companyRole` / plan values directly. Use
 * `usePermission(permission)` or `<Can permission=...>` (src/lib/auth), which
 * build a `PermissionSubject` from the current user + company plan and call
 * `can()`. Route gates and mock services may call `can()` directly.
 *
 * See docs/architecture-decisions.md.
 */
import type { CompanyPlan, CompanyRole, MemberStatus } from '../../types/company.types'

export type Permission =
  | 'company.edit'
  | 'company.legal'
  | 'members.manage'
  | 'billing.manage'
  | 'reports.view'
  | 'audit.view'
  | 'jd.create'
  | 'jd.submit'
  | 'jd.publishDirect'
  | 'jd.approve'
  | 'jd.assign'
  | 'cv.viewAll'
  | 'cv.viewOwn'

/** Who is asking. `role` undefined = the user is not a member of any company. */
export type PermissionSubject = {
  role: CompanyRole | undefined
  plan: CompanyPlan
  status: MemberStatus
}

/**
 * - `role`: the current plan offers this permission, but not to this role → hide the UI.
 * - `plan`: the permission needs another plan (upgrade), or the member is SUSPENDED → show a locked state.
 */
export type PermissionDeniedReason = 'role' | 'plan'

export type PermissionResult =
  | { allowed: true; reason?: undefined }
  | { allowed: false; reason: PermissionDeniedReason }

type PermissionTable = Record<CompanyPlan, Partial<Record<CompanyRole, readonly Permission[]>>>

export const PERMISSION_TABLE: PermissionTable = {
  FREE: {
    OWNER: ['company.edit', 'company.legal', 'billing.manage', 'jd.create', 'jd.publishDirect', 'cv.viewAll'],
  },
  PRO: {
    OWNER: ['company.edit', 'company.legal', 'members.manage', 'billing.manage', 'reports.view', 'audit.view'],
    MANAGER: ['jd.create', 'jd.publishDirect', 'jd.approve', 'jd.assign', 'cv.viewAll', 'reports.view'],
    STAFF: ['jd.create', 'jd.submit', 'cv.viewOwn'],
  },
}

const ALLOWED: PermissionResult = { allowed: true }
const DENIED_BY_ROLE: PermissionResult = { allowed: false, reason: 'role' }
const DENIED_BY_PLAN: PermissionResult = { allowed: false, reason: 'plan' }

function getPlanPermissions(plan: CompanyPlan): Set<Permission> {
  return new Set(Object.values(PERMISSION_TABLE[plan]).flatMap((permissions) => permissions ?? []))
}

const PLAN_PERMISSIONS: Record<CompanyPlan, Set<Permission>> = {
  FREE: getPlanPermissions('FREE'),
  PRO: getPlanPermissions('PRO'),
}

/**
 * Pure permission check.
 *
 * Order:
 * 1. `status === 'SUSPENDED'` → `{ allowed: false, reason: 'plan' }` for every permission (table not consulted).
 * 2. `role` undefined (not a company member) → `{ allowed: false, reason: 'role' }`.
 * 3. Permission listed for (plan, role) → `{ allowed: true }`.
 * 4. Permission not offered by ANY role of the current plan but offered by another plan
 *    (today: in PRO, not in FREE) → `{ allowed: false, reason: 'plan' }`.
 * 5. Otherwise → `{ allowed: false, reason: 'role' }`.
 *
 * Examples: FREE OWNER + jd.approve → plan; FREE OWNER + members.manage → plan;
 * PRO OWNER + jd.create → role; PRO STAFF + jd.approve → role.
 */
export function can(subject: PermissionSubject, permission: Permission): PermissionResult {
  if (subject.status === 'SUSPENDED') {
    return DENIED_BY_PLAN
  }

  if (!subject.role) {
    return DENIED_BY_ROLE
  }

  const rolePermissions = PERMISSION_TABLE[subject.plan][subject.role] ?? []

  if (rolePermissions.includes(permission)) {
    return ALLOWED
  }

  const offeredByCurrentPlan = PLAN_PERMISSIONS[subject.plan].has(permission)
  const offeredByOtherPlan = (Object.keys(PLAN_PERMISSIONS) as CompanyPlan[]).some(
    (plan) => plan !== subject.plan && PLAN_PERMISSIONS[plan].has(permission),
  )

  if (!offeredByCurrentPlan && offeredByOtherPlan) {
    return DENIED_BY_PLAN
  }

  return DENIED_BY_ROLE
}
