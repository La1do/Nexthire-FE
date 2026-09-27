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
 * - plan query failed → nothing (never a locked state or upgrade button for an unknown plan)
 */
export function Can({ permission, children, fallback = null, lockedFallback }: CanProps) {
  const state = usePermission(permission)

  if (state.isLoading || state.isError) {
    return null
  }

  if (state.allowed) {
    return <>{children}</>
  }

  if (state.reason === 'plan') {
    return <>{lockedFallback ? lockedFallback({ allowed: false, reason: 'plan' }) : null}</>
  }

  return <>{fallback}</>
}
