import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from '../i18n'
import { LanguageSwitch } from '../pages/_components'

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

function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="admin-brand" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-start)" />
          <stop offset="100%" stopColor="var(--color-brand-end)" />
        </linearGradient>
      </defs>
      <rect fill="url(#admin-brand)" height="32" rx="9" width="32" />
      <path d="M9 22V10h3.6c2.5 0 4 1.4 4 3.6 0 1.6-.9 2.7-2.2 3.2L18 22h-3.4l-2.7-4.6H12V22H9Zm3-7.2h1c1.1 0 1.7-.5 1.7-1.5s-.6-1.5-1.7-1.5h-1v3Z" fill="white" />
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
  const content = pages.adminUsers
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const currentPath = typeof window === 'undefined' ? '' : window.location.pathname
  const pageTitle = currentPath.startsWith('/admin/companies/')
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

  return (
    <div className="admin-shell">
      <aside
        aria-label="Admin navigation"
        aria-hidden={sidebarOpen ? undefined : 'true'}
        className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}
        id="admin-sidebar"
      >
        <div className="admin-sidebar__inner">
          <a className="admin-sidebar__brand" href="/">
            <span aria-hidden="true" className="admin-sidebar__brand-mark">
              <BrandMark />
            </span>
            <span>{common.brandName}</span>
          </a>

          <nav aria-label="Admin sections" className="admin-sidebar__nav">
            <a className="admin-sidebar__link" href="/admin/dashboard" tabIndex={sidebarOpen ? undefined : -1}>
              {content.sidebar.dashboard}
            </a>
            <a
              aria-current={currentPath.startsWith('/admin/users') ? 'page' : undefined}
              className={`admin-sidebar__link${currentPath.startsWith('/admin/users') ? ' is-active' : ''}`}
              href="/admin/users"
              tabIndex={sidebarOpen ? undefined : -1}
            >
              {content.sidebar.users}
            </a>
            <a
              aria-current={currentPath.startsWith('/admin/companies') ? 'page' : undefined}
              className={`admin-sidebar__link${currentPath.startsWith('/admin/companies') ? ' is-active' : ''}`}
              href="/admin/companies"
              tabIndex={sidebarOpen ? undefined : -1}
            >
              {common.navigation.companies}
            </a>
            <a className="admin-sidebar__link" href="/admin/jobs" tabIndex={sidebarOpen ? undefined : -1}>
              {content.sidebar.jobs}
            </a>
            <a className="admin-sidebar__link" href="/admin/settings" tabIndex={sidebarOpen ? undefined : -1}>
              {content.sidebar.settings}
            </a>
          </nav>

          <div className="admin-sidebar__user" tabIndex={sidebarOpen ? undefined : -1}>
            <span aria-hidden="true" className="admin-sidebar__user-avatar">{getInitials(content.currentUser.name)}</span>
            <div>
              <p className="admin-sidebar__user-name">{content.currentUser.name}</p>
              <p className="admin-sidebar__user-email">{content.currentUser.email}</p>
              <p className="admin-sidebar__user-role">{content.currentUser.role}</p>
            </div>
          </div>

          <button
            className="admin-sidebar__logout"
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
