import type { PermissionRequirement } from '../../lib/auth/permissions'

/**
 * Company RBAC gate for a route (evaluated by PermissionGateGuard, inside the layout).
 * `permission` may be an array meaning "any of". The gate is enforced on the FE by can(),
 * it never relies on the service answering 403.
 */
export type PermissionGate = {
  kind: 'recruiter-permission'
  permission: PermissionRequirement
}

export const recruiterJobsGate: PermissionGate = { kind: 'recruiter-permission', permission: 'jd.create' }

/** cv.* view permission (all or own). Owner is denied by ROLE → redirected to /recruiter. */
export const recruiterApplicationsGate: PermissionGate = {
  kind: 'recruiter-permission',
  permission: ['cv.viewAll', 'cv.viewOwn'],
}

export const recruiterCompanyLegalGate: PermissionGate = { kind: 'recruiter-permission', permission: 'company.legal' }
