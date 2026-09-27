import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import type { AuthApiRole } from '../../lib/auth/authRole'
import type { BusinessGate } from './businessGates'
import type { PermissionGate } from './permissionGates'

export type RouteAccess =
  | {
      kind: 'public'
      roles?: AuthApiRole[]
      loginPath?: string
    }
  | {
      kind: 'guest-only'
      targetRole?: AuthApiRole
    }
  | {
      kind: 'protected'
      roles: AuthApiRole[]
      loginPath?: string
    }

/**
 * Nested route rendered in the parent's <Outlet />. It inherits the parent's access, business gate and
 * layout, plus any permission gate the parent element renders (see `/recruiter/applications`).
 * `index: true` is the page for the parent path itself; otherwise `path` is relative (e.g. ':jobId').
 */
export type AppChildRoute =
  | {
      element: ReactNode
      index: true
      label: string
    }
  | {
      element: ReactNode
      index?: false
      label: string
      path: string
    }

export type AppRoute = {
  access?: RouteAccess
  businessGate?: BusinessGate
  /** Child routes rendered in `element`'s <Outlet />; `element` then acts as a layout route (e.g. a gate). */
  children?: AppChildRoute[]
  element: ReactNode
  label: string
  layout: ComponentType<PropsWithChildren>
  path: string
  /** Company RBAC gate for a flat route, checked inside the layout after the business gate. */
  permissionGate?: PermissionGate
}
