import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import type { AuthApiRole } from '../../lib/auth/authRole'
import type { BusinessGate } from './businessGates'

export type RouteAccess =
  | {
      kind: 'public'
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

export type AppRoute = {
  access?: RouteAccess
  businessGate?: BusinessGate
  element: ReactNode
  label: string
  layout: ComponentType<PropsWithChildren>
  path: string
}
