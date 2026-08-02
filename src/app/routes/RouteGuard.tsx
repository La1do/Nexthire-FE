import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { authTokenStorage } from '../../lib/api'
import type { AuthApiRole } from '../../lib/auth/authRole'
import type { RouteAccess } from './routeTypes'

type RouteGuardProps = PropsWithChildren<{
  access?: RouteAccess
}>

function getRoleHomePath(role: AuthApiRole) {
  if (role === 'CANDIDATE') return '/profile'
  if (role === 'RECRUITER') return '/recruiter'
  if (role === 'ADMIN') return '/admin/dashboard'

  return '/'
}

function getLoginPathForRole(role?: AuthApiRole) {
  if (role === 'RECRUITER') return '/recruiter/login'
  if (role === 'ADMIN') return '/admin/login'

  return '/login'
}

function getCurrentRedirect(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`
}

export function RouteGuard({ access, children }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const routeAccess = access ?? { kind: 'public' }
  const hasAccessToken = Boolean(authTokenStorage.getAccessToken())

  if (routeAccess.kind === 'public') {
    return <>{children}</>
  }

  if (routeAccess.kind === 'guest-only') {
    if (hasAccessToken && user) {
      return <Navigate replace to={getRoleHomePath(user.role)} />
    }

    return <>{children}</>
  }

  if (!hasAccessToken) {
    const firstAllowedRole = routeAccess.roles[0]
    const loginPath = routeAccess.loginPath ?? getLoginPathForRole(firstAllowedRole)
    const redirect = encodeURIComponent(getCurrentRedirect(location))

    return <Navigate replace to={`${loginPath}?redirect=${redirect}`} />
  }

  if (isAuthenticated && user && !routeAccess.roles.includes(user.role)) {
    return <Navigate replace to={getRoleHomePath(user.role)} />
  }

  return <>{children}</>
}
