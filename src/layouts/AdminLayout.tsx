import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../context'
import { useTranslations } from '../i18n'
import { BrandMark, ConfirmModal, LanguageSwitch } from '../pages/_components'
import { AdminNotificationPopover } from './components/AdminNotificationPopover'
import { AdminProfileMenu } from './components/AdminProfileMenu'
import { AdminTopbarSearch } from './components/AdminTopbarSearch'
import '../pages/_components/admin/admin-shared.css'
import './admin-layout.css'

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function getInitials(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
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
  const [openPopover, setOpenPopover] = useState<'notifications' | 'profile' | null>(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false))
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const { pathname: currentPath } = useLocation()
  const pageTitle = currentPath.startsWith('/admin/dashboard')
    ? pages.adminDashboard.pageTitle
    : currentPath.startsWith('/admin/ai-management')
      ? pages.adminAiManagement.pageTitle
    : currentPath.startsWith('/admin/jobs')
      ? pages.adminJobs.pageTitle
    : currentPath.startsWith('/admin/job-moderation-policies')
      ? pages.adminJobModerationPolicies.pageTitle
    : currentPath.startsWith('/admin/cv-templates')
      ? pages.adminCvTemplates.pageTitle
    : currentPath.startsWith('/admin/settings')
      ? pages.adminSettings.pageTitle
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

  useEffect(() => {
    if (!openPopover) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenPopover(null) }
    const closeOnOutside = (event: MouseEvent) => { if (!(event.target as HTMLElement | null)?.closest('.admin-topbar-popover-wrap')) setOpenPopover(null) }
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('mousedown', closeOnOutside)
    return () => { window.removeEventListener('keydown', closeOnEscape); window.removeEventListener('mousedown', closeOnOutside) }
  }, [openPopover])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 900px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
      if (!event.matches) {
        setSidebarOpen(false)
      }
    }
    setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const sidebarOpen = isSidebarOpen
  const isSidebarHidden = isMobile && !sidebarOpen
  const handleLogout = () => {
    void logout().then(() => {
      toast.success(common.authFeedback.logoutSuccess)
      navigate('/admin/login')
    })
  }

  return (
    <div className="admin-shell">
      <aside
        aria-label="Admin navigation"
        aria-hidden={isSidebarHidden ? 'true' : undefined}
        className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}
        id="admin-sidebar"
      >
        <div className="admin-sidebar__inner">
          <Link
            className="admin-sidebar__brand"
            tabIndex={isSidebarHidden ? -1 : undefined}
            to="/admin/dashboard"
          >
            <BrandMark compact label={common.brandName} />
          </Link>

          <nav aria-label="Admin sections" className="admin-sidebar__nav">
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/dashboard"
            >
              {content.sidebar.dashboard}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/users"
            >
              {content.sidebar.users}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/companies"
            >
              {common.navigation.companies}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/jobs"
            >
              {content.sidebar.jobs}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/job-moderation-policies"
            >
              {pages.adminJobModerationPolicies.sidebarLabel}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/cv-templates"
            >
              {pages.adminCvTemplates.sidebarLabel}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/ai-management"
            >
              {pages.adminAiManagement.sidebarLabel}
            </NavLink>
            <NavLink
              className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              tabIndex={isSidebarHidden ? -1 : undefined}
              to="/admin/settings"
            >
              {content.sidebar.settings}
            </NavLink>
          </nav>

          <div className="admin-sidebar__user">
            {user?.avatarUrl ? <img alt="" className="admin-sidebar__user-avatar admin-sidebar__user-avatar--image" src={user.avatarUrl} /> : <span aria-hidden="true" className="admin-sidebar__user-avatar">{getInitials(user?.fullName || user?.email || content.currentUser.name)}</span>}
            <div>
              <p className="admin-sidebar__user-name">{user?.fullName || content.currentUser.name}</p>
              <p className="admin-sidebar__user-email">{user?.email || content.currentUser.email}</p>
              <p className="admin-sidebar__user-role">{user?.role || content.currentUser.role}</p>
            </div>
          </div>

          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            tabIndex={isSidebarHidden ? -1 : undefined}
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

          <AdminTopbarSearch content={content.topbar} />

          <div className="admin-topbar__actions">
            <LanguageSwitch compact />
            <AdminNotificationPopover content={content.topbar} isOpen={openPopover === 'notifications'} onToggle={() => setOpenPopover((value) => value === 'notifications' ? null : 'notifications')} />
            <AdminProfileMenu content={content.topbar} isOpen={openPopover === 'profile'} onLogout={() => { setOpenPopover(null); setLogoutConfirmOpen(true) }} onToggle={() => setOpenPopover((value) => value === 'profile' ? null : 'profile')} user={user} />
          </div>
        </header>

        <main className="admin-main__content">{children}</main>
      </div>
      <ConfirmModal cancelLabel={pages.adminSettings.logout.cancel} confirmLabel={pages.adminSettings.logout.confirm} description={pages.adminSettings.logout.description} isOpen={logoutConfirmOpen} onCancel={() => setLogoutConfirmOpen(false)} onConfirm={handleLogout} title={pages.adminSettings.logout.title} />
    </div>
  )
}
