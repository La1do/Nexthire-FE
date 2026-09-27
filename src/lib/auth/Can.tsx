import type { ReactNode } from 'react'
import type { Permission, PermissionResult } from './permissions'
import { usePermission } from './usePermission'

type CanProps = {
  permission: Permission
  children: ReactNode
  /** Rendered when denied by role (default: nothing, i.e. hidden). */
  fallback?: ReactNode
  /** Rendered when denied by plan (upgrade needed or member suspended). Receives the can() result, e.g. for PlanLock. */
  lockedFallback?: (result: PermissionResult) => ReactNode
}

/**
 * Declarative permission gate. No styling and no permission logic:
 * - allowed → children
 * - reason 'role' → `fallback` (default nothing)
 * - reason 'plan' → `lockedFallback(result)` if provided, else nothing
 * - plan still loading → nothing
 */
export function Can({ permission, children, fallback = null, lockedFallback }: CanProps) {
  const { isLoading, ...result } = usePermission(permission)

  if (isLoading) {
    return null
  }

  if (result.allowed) {
    return <>{children}</>
  }

  if (result.reason === 'plan') {
    return <>{lockedFallback ? lockedFallback(result) : null}</>
  }

  return <>{fallback}</>
}
