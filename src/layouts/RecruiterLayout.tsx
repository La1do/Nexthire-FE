import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthUserDisplayName, getInitials, useAuth, useToast } from '../context'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'
import { UserNotificationPopover } from './components/UserNotificationPopover'

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function RecruiterLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const content = pages.recruiterHome
  const { logout, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const currentPath = typeof window === 'undefined' ? '' : window.location.pathname
  const isJobFormPath = currentPath.startsWith('/recruiter/jobs/new') ||
    (currentPath.startsWith('/recruiter/jobs/') && currentPath.endsWith('/edit'))
  const isApplicationsPath = currentPath.startsWith('/recruiter/applications')
  const isSettingsPath = currentPath.startsWith('/recruiter/settings')
  const isVerificationPath = currentPath.startsWith('/recruiter/verification')
  const topbarContent = isJobFormPath
    ? pages.recruiterJobCreate
    : currentPath.startsWith('/recruiter/jobs')
      ? pages.recruiterJobs
      : isApplicationsPath
        ? pages.recruiterApplications
        : isSettingsPath
          ? pages.recruiterSettings
          : isVerificationPath
            ? pages.recruiterVerification
            : content
  const displayName = user ? getAuthUserDisplayName(user) : common.brandName
  const avatarLabel = user?.logoUrl ? user.companyName ?? displayName : getInitials(displayName)
  const navItems = [
    { href: '/recruiter', label: content.sidebar.overview },
    { href: '/recruiter/jobs', label: content.sidebar.jobs },
    { href: '/recruiter/applications', label: pages.recruiterApplications.routeLabel },
    { href: '/recruiter/candidates', label: content.sidebar.candidates },
    { href: '/recruiter/company', label: content.sidebar.company },
    { href: '/recruiter/messages', label: content.sidebar.messages },
    { href: '/recruiter/settings', label: content.sidebar.settings },
  ]

  useEffect(() => {
    if (!isSidebarOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        toggleButtonRef.current?.focus()
      }
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest('.recruiter-sidebar__inner, .recruiter-topbar__toggle')) {
        return
      }
      setSidebarOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [isSidebarOpen])

  const handleLogout = () => {
    void logout().then(() => {
      toast.success(common.authFeedback.logoutSuccess)
      navigate('/login')
    })
  }

  return (
    <div className="recruiter-shell">
      <aside
        aria-label={content.routeLabel}
        className={`recruiter-sidebar${isSidebarOpen ? ' is-open' : ''}`}
        id="recruiter-sidebar"
      >
        <div className="recruiter-sidebar__inner">
          <a className="recruiter-sidebar__brand" href="/home">
            <BrandMark compact label={common.brandName} />
          </a>

          <nav aria-label={content.routeLabel} className="recruiter-sidebar__nav">
            {navItems.map((item) => {
              const isActive =
                item.href === '/recruiter'
                  ? currentPath === item.href
                  : currentPath.startsWith(item.href)

              return (
                <a
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'is-active' : undefined}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="recruiter-sidebar__user">
            <div className="recruiter-sidebar__user-avatar">
              {user?.logoUrl ? (
                <img alt={user.companyName ? `${user.companyName} logo` : ''} src={user.logoUrl} />
              ) : (
                <span>{avatarLabel}</span>
              )}
            </div>
            <div className="recruiter-sidebar__user-info">
              <strong>{displayName}</strong>
              <small>{user?.companyName ?? content.sidebar.currentRole}</small>
            </div>
          </div>

          <button
            className="recruiter-sidebar__logout"
            onClick={handleLogout}
            type="button"
          >
            {content.sidebar.logout}
          </button>
        </div>
      </aside>

      <div className="recruiter-main">
        <header className="recruiter-topbar">
          <button
            aria-controls="recruiter-sidebar"
            aria-expanded={isSidebarOpen}
            aria-label={content.topbar.toggleSidebarLabel}
            className="recruiter-topbar__toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            ref={toggleButtonRef}
            type="button"
          >
            <MenuIcon />
          </button>

          <div className="recruiter-topbar__heading">
            <h1>{topbarContent.pageTitle}</h1>
            <p>{topbarContent.pageSubtitle}</p>
          </div>

          <label className="recruiter-topbar__search">
            <span className="sr-only">{content.topbar.searchPlaceholder}</span>
            <SearchIcon />
            <input
              aria-label={content.topbar.searchPlaceholder}
              placeholder={content.topbar.searchPlaceholder}
              type="search"
            />
          </label>

          <div className="recruiter-topbar__actions">
            <LanguageSwitch compact />
            <UserNotificationPopover
              buttonClassName="recruiter-topbar__icon-button"
              content={content.topbar.notifications}
              fallbackHref="/recruiter"
              variant="card"
            />
          </div>
        </header>

        <main className="recruiter-main__content">{children}</main>
      </div>
    </div>
  )
}
