import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../context'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function AdminLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const { logout, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const content = pages.adminUsers
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const { pathname: currentPath } = useLocation()
  const pageTitle = currentPath.startsWith('/admin/dashboard')
    ? pages.adminDashboard.pageTitle
    : currentPath.startsWith('/admin/companies/')
      ? pages.adminCompanies.detail.pageTitle
      : currentPath.startsWith('/admin/companies')
        ? pages.adminCompanies.pageTitle
        : content.pageTitle

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
      if (target?.closest('.admin-sidebar__inner, .admin-topbar__toggle')) {
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

  const sidebarOpen = isSidebarOpen
  const handleLogout = () => {
    void logout().then(() => {
      toast.success(common.authFeedback.logoutSuccess)
      navigate('/login')
    })
  }

  return (
    <div className="admin-shell">
      <aside
        aria-label="Admin navigation"
        aria-hidden={sidebarOpen ? undefined : 'true'}
        className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}
        id="admin-sidebar"
      >
        <div className="admin-sidebar__inner">
          <Link className="admin-sidebar__brand" to="/">
            <BrandMark compact label={common.brandName} />
          </Link>

          <nav aria-label="Admin sections" className="admin-sidebar__nav">
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={sidebarOpen ? undefined : -1}
              to="/admin/dashboard"
            >
              {content.sidebar.dashboard}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={sidebarOpen ? undefined : -1}
              to="/admin/users"
            >
              {content.sidebar.users}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={sidebarOpen ? undefined : -1}
              to="/admin/companies"
            >
              {common.navigation.companies}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={sidebarOpen ? undefined : -1}
              to="/admin/jobs"
            >
              {content.sidebar.jobs}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={sidebarOpen ? undefined : -1}
              to="/admin/settings"
            >
              {content.sidebar.settings}
            </NavLink>
          </nav>

          <div className="admin-sidebar__user" tabIndex={sidebarOpen ? undefined : -1}>
            <span aria-hidden="true" className="admin-sidebar__user-avatar">
              {getInitials(user?.fullName || user?.email || content.currentUser.name)}
            </span>
            <div>
              <p className="admin-sidebar__user-name">{user?.fullName || content.currentUser.name}</p>
              <p className="admin-sidebar__user-email">{user?.email || content.currentUser.email}</p>
              <p className="admin-sidebar__user-role">{user?.role || content.currentUser.role}</p>
            </div>
          </div>

          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            tabIndex={sidebarOpen ? undefined : -1}
            type="button"
          >
            {content.sidebar.logout}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            aria-controls="admin-sidebar"
            aria-expanded={sidebarOpen}
            aria-label={content.topbar.toggleSidebarLabel}
            className="admin-topbar__toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            ref={toggleButtonRef}
            type="button"
          >
            <MenuIcon />
          </button>

          <h1 className="admin-topbar__title">{pageTitle}</h1>

          <label className="admin-topbar__search">
            <span className="sr-only">{content.topbar.searchPlaceholder}</span>
            <input
              aria-label={content.topbar.searchPlaceholder}
              placeholder={content.topbar.searchPlaceholder}
              type="search"
            />
          </label>

          <div className="admin-topbar__actions">
            <LanguageSwitch compact />
            <button
              aria-label={content.topbar.notificationsLabel}
              className="admin-topbar__icon-button"
              type="button"
            >
              <BellIcon />
            </button>

            <button
              aria-label={content.topbar.profileLabel}
              className="admin-topbar__icon-button"
              type="button"
            >
              <UserIcon />
            </button>
          </div>
        </header>

        <main className="admin-main__content">{children}</main>
      </div>
    </div>
  )
}
