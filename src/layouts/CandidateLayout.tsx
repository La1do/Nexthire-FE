import { useEffect, useId, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  const [isCompactHeader, setCompactHeader] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(max-width: 860px)').matches
  })
  const [isNavOpen, setNavOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const navId = useId()
  const showAvatarImage = Boolean(user?.avatarUrl) && !avatarFailed

  useEffect(() => {
    setAvatarFailed(false)
  }, [user?.avatarUrl])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 860px)')
    const syncCompactHeader = () => setCompactHeader(mediaQuery.matches)

    syncCompactHeader()
    mediaQuery.addEventListener('change', syncCompactHeader)
    return () => mediaQuery.removeEventListener('change', syncCompactHeader)
  }, [])

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isNavOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (sidebarRef.current?.contains(event.target as Node)) {
        return
      }

      setNavOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      setNavOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNavOpen])

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
      <aside className="candidate-sidebar" ref={sidebarRef}>
        <Link className="candidate-brand" to="/home">
          <BrandMark compact label={common.brandName} />
        </Link>

        <div className="candidate-mobile-header-actions">
          {isCompactHeader ? (
            <div className="candidate-mobile-notification" onClick={() => setNavOpen(false)}>
              <UserNotificationPopover
                buttonClassName="candidate-mobile-notification-button"
                content={profile.topbar.notifications}
                fallbackHref="/profile"
                variant="card"
              />
            </div>
          ) : null}

          <button
            aria-controls={navId}
            aria-expanded={isNavOpen}
            aria-label={profile.sidebar.navigationMenu}
            className="candidate-nav-toggle"
            onClick={() => setNavOpen((current) => !current)}
            type="button"
          >
            <span className="candidate-nav-toggle__label">{profile.sidebar.navigationMenu}</span>
            <span aria-hidden="true" className="candidate-nav-toggle__icon">
              <span />
              <span />
            </span>
            <span className="candidate-nav-toggle__avatar">
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
          </button>
        </div>

        <nav
          aria-label={profile.routeLabel}
          className={`candidate-nav${isNavOpen ? ' is-open' : ''}`}
          id={navId}
        >
          {navItems.map((item) => (
            <Link aria-current={pathname === item.href ? 'page' : undefined} key={item.label} to={item.href}>
              {item.label}
            </Link>
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
            {!isCompactHeader ? (
              <UserNotificationPopover
                content={profile.topbar.notifications}
                fallbackHref="/profile"
                variant="card"
              />
            ) : null}
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
