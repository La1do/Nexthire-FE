import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { useTeamMe } from '../../hooks/useTeamMe'
import { useTranslations } from '../../i18n'
import { isMemberSuspended } from '../../lib/auth/permissions'
import { CompanyAccessState } from '../../pages/_components'

/**
 * Wraps the whole recruiter shell. Refetches GET /auth/me on entering the recruiter area (useTeamMe)
 * so a stale persisted companyMemberStatus / companyRole is corrected before anything renders.
 * - no data yet → checking state; failed with no data → error + Retry + Log out (UNKNOWN ≠ suspended)
 * - SUSPENDED → full-page notice with Log out only (no menu, no data, no upgrade button)
 * - otherwise → children
 */
export function SuspendedGate({ children }: PropsWithChildren) {
  const { common } = useTranslations()
  const text = common.companyAccess
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const meQuery = useTeamMe()

  if (user?.role !== 'RECRUITER') {
    return <>{children}</>
  }

  const handleLogout = () => {
    void logout().then(() => {
      navigate('/recruiter/login')
    })
  }

  const logoutButton = (
    <button className="company-access-state__button" onClick={handleLogout} type="button">
      {text.logout}
    </button>
  )

  if (!meQuery.data) {
    if (meQuery.isError) {
      return (
        <CompanyAccessState
          actions={
            <>
              <button
                className="company-access-state__button company-access-state__button--primary"
                onClick={() => {
                  void meQuery.refetch()
                }}
                type="button"
              >
                {text.retry}
              </button>
              {logoutButton}
            </>
          }
          description={text.errorDescription}
          size="page"
          title={text.errorTitle}
          tone="error"
        />
      )
    }

    return <CompanyAccessState size="page" title={text.checking} tone="loading" />
  }

  if (isMemberSuspended(meQuery.data.companyMemberStatus)) {
    return (
      <CompanyAccessState
        actions={logoutButton}
        description={text.suspendedDescription}
        size="page"
        title={text.suspendedTitle}
        tone="warning"
      />
    )
  }

  return <>{children}</>
}
