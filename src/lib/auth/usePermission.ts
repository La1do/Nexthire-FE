import { checkPermission } from './permissions'
import type { PermissionRequirement, PermissionResult } from './permissions'
import { usePermissionSubject } from './usePermissionSubject'

/**
 * - Plan known → the `can()` result (`isLoading: false`, `isError: false`).
 * - Plan loading, or plan query failed with no cached plan → UNKNOWN: `allowed: false` with NO `reason`.
 *   Callers must show a loading / error state, never a locked state or an upgrade button.
 */
export type UsePermissionResult =
  | (PermissionResult & { isLoading: false; isError: false })
  | { allowed: false; reason?: undefined; isLoading: true; isError: false }
  | { allowed: false; reason?: undefined; isLoading: false; isError: true }

/**
 * Permission check for the current user. Only builds the subject (usePermissionSubject) and delegates
 * to `can()` / `canAny()` — no permission logic lives here. An array means "any of".
 */
export function usePermission(permission: PermissionRequirement): UsePermissionResult {
  const state = usePermissionSubject()

  if (state.status === 'loading') {
    return { allowed: false, isError: false, isLoading: true }
  }

  if (state.status === 'error') {
    return { allowed: false, isError: true, isLoading: false }
  }

  return { ...checkPermission(state.subject, permission), isError: false, isLoading: false }
}
