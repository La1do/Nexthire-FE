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
import type { CompanyPlan, CompanyRole, CompanySeatLimit, MemberStatus } from '../../types/company.types'
import type { AuthApiRole } from './authRole'

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

/** One permission, or a list meaning "any of these" (e.g. cv.viewAll OR cv.viewOwn). */
export type PermissionRequirement = Permission | readonly Permission[]

type PermissionTable = Readonly<Record<CompanyPlan, Readonly<Partial<Record<CompanyRole, readonly Permission[]>>>>>

function deepFreeze<TValue>(value: TValue): TValue {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach((child) => deepFreeze(child))
    Object.freeze(value)
  }

  return value
}

/** Deep-frozen: mock code or pages cannot mutate the table at runtime. */
export const PERMISSION_TABLE: PermissionTable = deepFreeze({
  FREE: {
    OWNER: ['company.edit', 'company.legal', 'billing.manage', 'jd.create', 'jd.publishDirect', 'cv.viewAll'],
  },
  PRO: {
    OWNER: ['company.edit', 'company.legal', 'members.manage', 'billing.manage', 'reports.view', 'audit.view'],
    MANAGER: ['jd.create', 'jd.publishDirect', 'jd.approve', 'jd.assign', 'cv.viewAll', 'reports.view'],
    STAFF: ['jd.create', 'jd.submit', 'cv.viewOwn'],
  },
})

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

/**
 * "Any of" check. Allowed when any permission is allowed; otherwise 'plan' when at least one
 * permission is plan-blocked (upgrade would help), else 'role'. SUSPENDED still yields 'plan'.
 */
export function canAny(subject: PermissionSubject, permissions: readonly Permission[]): PermissionResult {
  const results = permissions.map((permission) => can(subject, permission))

  if (results.some((result) => result.allowed)) {
    return ALLOWED
  }

  if (results.some((result) => result.reason === 'plan')) {
    return DENIED_BY_PLAN
  }

  return DENIED_BY_ROLE
}

export function checkPermission(subject: PermissionSubject, requirement: PermissionRequirement): PermissionResult {
  return typeof requirement === 'string' ? can(subject, requirement) : canAny(subject, requirement)
}

export function isMemberSuspended(status: MemberStatus | undefined): boolean {
  return status === 'SUSPENDED'
}

/**
 * Builds the subject from the auth user fields + the company plan.
 *
 * Legacy compatibility — TODO(BE): remove once /auth/me returns `companyRole`.
 * The current backend has single-owner companies and does not send `companyRole`; a RECRUITER
 * without it is treated as the OWNER of its own company, which keeps today's real-API behavior
 * (FREE OWNER can do everything the existing recruiter pages need). Mock accounts always carry a role.
 */
export function buildPermissionSubject(
  user: { role?: AuthApiRole; companyRole?: CompanyRole; companyMemberStatus?: MemberStatus } | null | undefined,
  plan: CompanyPlan,
): PermissionSubject {
  // TODO(BE): temporary real-API fallback — a RECRUITER without `companyRole` is treated as OWNER.
  // Remove once the BE returns companyRole / companyMemberStatus / companyId (/auth/login, /auth/me)
  // and a company plan endpoint.
  const legacyRole: CompanyRole | undefined = user?.role === 'RECRUITER' ? 'OWNER' : undefined

  return {
    plan,
    role: user?.companyRole ?? legacyRole,
    status: user?.companyMemberStatus ?? 'ACTIVE',
  }
}

/** Which records a member may list. Mirrors the backend rule; used by the mock services. */
export type RecordVisibility = 'all' | 'own' | 'none'

/**
 * Jobs (JD): Manager / Owner FREE (jd.approve or jd.publishDirect) → all company jobs;
 * Staff (jd.submit) → only jobs where assigneeId === me; anyone else (e.g. Owner PRO, suspended) → none (403).
 */
export function getJobVisibility(subject: PermissionSubject): RecordVisibility {
  if (canAny(subject, ['jd.approve', 'jd.publishDirect']).allowed) {
    return 'all'
  }

  return can(subject, 'jd.submit').allowed ? 'own' : 'none'
}

/**
 * Applications (CV): cv.viewAll → all; cv.viewOwn → applications whose job is assigned to me
 * or whose handlerId === me; otherwise none (403, e.g. Owner PRO, suspended).
 */
export function getApplicationVisibility(subject: PermissionSubject): RecordVisibility {
  if (can(subject, 'cv.viewAll').allowed) {
    return 'all'
  }

  return can(subject, 'cv.viewOwn').allowed ? 'own' : 'none'
}

const PLAN_RANK: Readonly<Record<CompanyPlan, number>> = Object.freeze({ FREE: 0, PRO: 1 })

/** True when moving from `from` to `to` is an upgrade (e.g. FREE → PRO). */
export function isPlanUpgrade(from: CompanyPlan, to: CompanyPlan): boolean {
  return PLAN_RANK[to] > PLAN_RANK[from]
}

/** Seat quota per plan for non-Owner roles (the Owner seat is always included). */
export const PLAN_SEAT_LIMITS: Readonly<Record<CompanyPlan, Readonly<CompanySeatLimit>>> = deepFreeze({
  FREE: { MANAGER: 0, STAFF: 0 },
  PRO: { MANAGER: 1, STAFF: 3 },
})
