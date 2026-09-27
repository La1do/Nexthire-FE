import type { ApplicationPermissionState } from '../types'

export type StaffFilterPermission = ApplicationPermissionState & {
  retry: () => void
}

const noop = () => undefined

/**
 * Whether the "filter by Staff" control may be shown (Manager only).
 *
 * TODO(A0): replace the body with the shared hook once A0 is merged, e.g.
 *   const permission = usePermission('jd.assign')
 *   return { allowed: permission.allowed, isError: permission.isError,
 *            isLoading: permission.isLoading, retry: <refetch company plan> }
 * (`jd.assign` is Manager-only in the A0 table; confirm the permission name with
 * the Lead.) Never compare roles here. Until then the control stays visible so
 * the UI can be reviewed.
 */
export function useStaffFilterPermission(): StaffFilterPermission {
  return { allowed: true, isError: false, isLoading: false, retry: noop }
}
