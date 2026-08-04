import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAuthUserDisplayName, getInitials, useAuth, useToast } from '../context'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'
import { UserNotificationPopover } from './components/UserNotificationPopover'

export function CandidateLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const toast = useToast()
  const profile = pages.profile
  const candidateCvs = pages.candidateCvs
  const candidateSettings = pages.candidateSettings
  const userDisplayName = user ? getAuthUserDisplayName(user) : common.brandName
  const [avatarFailed, setAvatarFailed] = useState(false)
  const showAvatarImage = Boolean(user?.avatarUrl) && !avatarFailed

  useEffect(() => {
    setAvatarFailed(false)
  }, [user?.avatarUrl])

  async function handleLogout() {
    await logout()
    toast.success(common.authFeedback.logoutSuccess)
    navigate('/login')
  }

  const navItems = [
    { href: '/search', label: profile.sidebar.searchJobs },
    { href: '/profile/jobs', label: profile.sidebar.managedJobs },
    { href: '/profile/applications', label: profile.sidebar.applications },
    { href: '/profile/cvs', label: candidateCvs.routeLabel },
    { href: '/profile', label: profile.sidebar.profile },
    { href: '/profile/messages', label: profile.sidebar.messages },
    { href: '/profile/settings', label: candidateSettings.routeLabel },
  ]
  const pageTitle =
    pathname === '/profile/applications'
      ? profile.applications.pageTitle
      : pathname === '/profile/cvs'
        ? candidateCvs.pageTitle
      : pathname === '/profile/jobs'
        ? profile.managedJobs.pageTitle
        : pathname === '/profile/settings'
          ? candidateSettings.pageTitle
          : profile.pageTitle

  return (
    <div className="candidate-shell">
      <aside className="candidate-sidebar">
        <a className="candidate-brand" href="/">
          <BrandMark compact label={common.brandName} />
        </a>

        <nav aria-label={profile.routeLabel} className="candidate-nav">
          {navItems.map((item) => (
            <a aria-current={pathname === item.href ? 'page' : undefined} href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="candidate-sidebar-user">
          <span>
            {showAvatarImage ? (
              <img
                alt={userDisplayName}
                onError={() => setAvatarFailed(true)}
                src={user?.avatarUrl ?? ''}
              />
            ) : (
              getInitials(userDisplayName)
            )}
          </span>
          <div>
            <strong>{userDisplayName}</strong>
            <small>{profile.sidebar.currentRole}</small>
          </div>
        </div>
      </aside>

      <div className="candidate-main">
        <header className="candidate-topbar">
          <h1>{pageTitle}</h1>
          <div className="candidate-topbar-actions">
            <LanguageSwitch compact />
            <UserNotificationPopover
              content={profile.topbar.notifications}
              fallbackHref="/profile"
              variant="card"
            />
            <button onClick={() => void handleLogout()} type="button">
              {profile.topbar.logout}
            </button>
          </div>
        </header>

        <main className="candidate-content">{children}</main>
      </div>
    </div>
  )
}
