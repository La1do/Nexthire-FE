import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { RECRUITER_HOME_PATH } from '../../constants/recruiterPaths'
import { useTranslations } from '../../i18n'
import { usePermission } from '../../lib/auth/usePermission'
import { usePermissionSubject } from '../../lib/auth/usePermissionSubject'
import { CompanyAccessState, PlanLockPlaceholder } from '../../pages/_components'
import type { PermissionGate } from './permissionGates'

type PermissionGateGuardProps = PropsWithChildren<{
  gate?: PermissionGate
}>

function RecruiterPermissionGate({ children, gate }: PropsWithChildren<{ gate: PermissionGate }>) {
  const { common } = useTranslations()
  const text = common.companyAccess
  const state = usePermission(gate.permission)

  // Unknown (plan loading / failed) is never treated as FREE: no redirect, no lock, no upgrade button.
  if (state.isLoading) {
    return <CompanyAccessState title={text.checking} tone="loading" />
  }

  if (state.isError) {
    return <PermissionGateError />
  }

  if (state.allowed) {
    return <>{children}</>
  }

  if (state.reason === 'plan') {
    return <PlanLockPlaceholder result={state} />
  }

  return <Navigate replace to={RECRUITER_HOME_PATH} />
}

function PermissionGateError() {
  const { common } = useTranslations()
  const text = common.companyAccess
  const subjectState = usePermissionSubject()
  const handleRetry = () => {
    if (subjectState.status === 'error') {
      subjectState.retry()
    }
  }

  return (
    <CompanyAccessState
      actions={
        <button className="company-access-state__button company-access-state__button--primary" onClick={handleRetry} type="button">
          {text.retry}
        </button>
      }
      description={text.errorDescription}
      title={text.errorTitle}
      tone="error"
    />
  )
}

/**
 * Route-level company RBAC check, rendered INSIDE the layout (after RouteGuard + BusinessGateGuard):
 * loading → checking state; error → message + Retry; denied by role → redirect to /recruiter;
 * denied by plan → PlanLockPlaceholder; allowed → children. Never depends on a service 403.
 * As a layout-route element, pass <Outlet /> as children so every child route is covered.
 */
export function PermissionGateGuard({ children, gate }: PermissionGateGuardProps) {
  if (!gate) {
    return <>{children}</>
  }

  return <RecruiterPermissionGate gate={gate}>{children}</RecruiterPermissionGate>
}
