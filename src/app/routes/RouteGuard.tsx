import { useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../../context'
import { useTranslations } from '../../i18n'
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

type AuthGuardReason = 'auth-required' | 'role-mismatch' | 'role-switch'

function getRoleLabel(
  role: AuthApiRole,
  labels: { adminRole: string; candidateRole: string; recruiterRole: string },
) {
  if (role === 'ADMIN') return labels.adminRole
  if (role === 'RECRUITER') return labels.recruiterRole

  return labels.candidateRole
}

function formatAuthGuardMessage(
  template: string,
  values: { currentRole?: string; requiredRole: string },
) {
  return template
    .replaceAll('{{currentRole}}', values.currentRole ?? '')
    .replaceAll('{{requiredRole}}', values.requiredRole)
}

function buildLoginRedirectPath({
  currentRole,
  loginPath,
  reason,
  redirect,
  requiredRole,
}: {
  currentRole?: AuthApiRole
  loginPath: string
  reason: AuthGuardReason
  redirect?: string
  requiredRole: AuthApiRole
}) {
  const params = new URLSearchParams()

  if (redirect) {
    params.set('redirect', redirect)
  }

  if (currentRole) {
    params.set('currentRole', currentRole)
  }

  params.set('requiredRole', requiredRole)
  params.set('reason', reason)

  return `${loginPath}?${params.toString()}`
}

function RoleBoundaryRedirect({
  currentRole,
  loginPath,
  reason,
  redirect,
  requiredRole,
}: {
  currentRole: AuthApiRole
  loginPath: string
  reason: Exclude<AuthGuardReason, 'auth-required'>
  redirect?: string
  requiredRole: AuthApiRole
}) {
  const didHandleRef = useRef(false)
  const navigate = useNavigate()
  const { common } = useTranslations()
  const { logout } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (didHandleRef.current) {
      return
    }

    didHandleRef.current = true

    const requiredRoleLabel = getRoleLabel(requiredRole, common.authUser)
    const currentRoleLabel = getRoleLabel(currentRole, common.authUser)
    const isRoleSwitch = reason === 'role-switch'
    const title = isRoleSwitch
      ? common.authGuard.roleSwitchTitle
      : common.authGuard.roleMismatchTitle
    const message = formatAuthGuardMessage(
      isRoleSwitch ? common.authGuard.roleSwitchMessage : common.authGuard.roleMismatchMessage,
      {
        currentRole: currentRoleLabel,
        requiredRole: requiredRoleLabel,
      },
    )

    toast.warning(message, {
      id: `route-guard-${reason}-${currentRole}-${requiredRole}`,
      title,
    })
    void logout()
    navigate(
      buildLoginRedirectPath({
        currentRole,
        loginPath,
        reason,
        redirect,
        requiredRole,
      }),
      { replace: true },
    )
  }, [common.authGuard, common.authUser, currentRole, loginPath, logout, navigate, reason, redirect, requiredRole, toast])

  return null
}

export function RouteGuard({ access, children }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const routeAccess = access ?? { kind: 'public' }
  const hasAccessToken = Boolean(authTokenStorage.getAccessToken())

  if (routeAccess.kind === 'public') {
    if (hasAccessToken && user && routeAccess.roles && !routeAccess.roles.includes(user.role)) {
      const firstAllowedRole = routeAccess.roles[0]

      return (
        <RoleBoundaryRedirect
          currentRole={user.role}
          loginPath={routeAccess.loginPath ?? getLoginPathForRole(firstAllowedRole)}
          reason="role-mismatch"
          redirect={getCurrentRedirect(location)}
          requiredRole={firstAllowedRole}
        />
      )
    }

    return <>{children}</>
  }

  if (routeAccess.kind === 'guest-only') {
    if (hasAccessToken && user) {
      if (routeAccess.targetRole && routeAccess.targetRole !== user.role) {
        return (
          <RoleBoundaryRedirect
            currentRole={user.role}
            loginPath={location.pathname}
            reason="role-switch"
            requiredRole={routeAccess.targetRole}
          />
        )
      }

      return <Navigate replace to={getRoleHomePath(user.role)} />
    }

    return <>{children}</>
  }

  if (!hasAccessToken) {
    const firstAllowedRole = routeAccess.roles[0]
    const loginPath = routeAccess.loginPath ?? getLoginPathForRole(firstAllowedRole)

    return (
      <Navigate
        replace
        to={buildLoginRedirectPath({
          loginPath,
          reason: 'auth-required',
          redirect: getCurrentRedirect(location),
          requiredRole: firstAllowedRole,
        })}
      />
    )
  }

  if (!user) {
    const firstAllowedRole = routeAccess.roles[0]
    const loginPath = routeAccess.loginPath ?? getLoginPathForRole(firstAllowedRole)

    return (
      <Navigate
        replace
        to={buildLoginRedirectPath({
          loginPath,
          reason: 'auth-required',
          redirect: getCurrentRedirect(location),
          requiredRole: firstAllowedRole,
        })}
      />
    )
  }

  if (isAuthenticated && user && !routeAccess.roles.includes(user.role)) {
    const firstAllowedRole = routeAccess.roles[0]
    return (
      <RoleBoundaryRedirect
        currentRole={user.role}
        loginPath={routeAccess.loginPath ?? getLoginPathForRole(firstAllowedRole)}
        reason="role-mismatch"
        redirect={getCurrentRedirect(location)}
        requiredRole={firstAllowedRole}
      />
    )
  }

  return <>{children}</>
}
