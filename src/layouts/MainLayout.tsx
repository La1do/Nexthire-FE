import { useEffect, useId, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  getAuthUserDisplayName,
  getInitials,
  useAuth,
  useToast,
} from '../context'
import type { AuthApiRole } from '../lib/auth/authRole'
import type { AuthUser } from '../services/auth.service'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'
import { UserNotificationPopover } from './components/UserNotificationPopover'
import './main-layout.css'

function getRoleLabel(
  role: AuthApiRole,
  labels: { candidateRole: string; recruiterRole: string; adminRole: string },
) {
  if (role === 'CANDIDATE') return labels.candidateRole
  if (role === 'RECRUITER') return labels.recruiterRole
  return labels.adminRole
}

function getUserMetaLabel(
  user: AuthUser,
  labels: { candidateRole: string; recruiterRole: string; adminRole: string },
) {
  const roleLabel = getRoleLabel(user.role, labels)
  return user.role === 'RECRUITER' && user.companyName
    ? `${user.companyName} - ${roleLabel}`
    : roleLabel
}

function getProfileHref(role: AuthApiRole) {
  if (role === 'CANDIDATE') return '/profile'
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/recruiter'
}

type MainUserMenuProps = {
  labels: {
    profile: string
    logout: string
    menuLabel: string
    candidateRole: string
    recruiterRole: string
    adminRole: string
  }
  onLogout: () => void
  user: AuthUser
}

function MainUserMenu({ labels, onLogout, user }: MainUserMenuProps) {
  const [isOpen, setOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const displayName = getAuthUserDisplayName(user)
  const metaLabel = getUserMetaLabel(user, labels)
  const profileHref = getProfileHref(user.role)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return
      }

      setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogoutClick = () => {
    setOpen(false)
    onLogout()
  }

  return (
    <div className={`main-user-menu${isOpen ? ' is-open' : ''}`} ref={menuRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={labels.menuLabel}
        className="main-user-trigger"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {user.logoUrl ? (
          <img
            alt={user.companyName ? `${user.companyName} logo` : ''}
            className="main-user-avatar"
            src={user.logoUrl}
          />
        ) : (
          <span className="main-user-avatar main-user-avatar--initials">
            {getInitials(displayName)}
          </span>
        )}
        <span className="main-user-meta">
          <strong>{displayName}</strong>
          <small>{metaLabel}</small>
        </span>
        <span aria-hidden="true" className="main-user-caret" />
      </button>

      <div className="main-user-dropdown" hidden={!isOpen} id={menuId} role="menu">
        <div className="main-user-dropdown-header" role="none">
          {user.logoUrl ? (
            <img
              alt={user.companyName ? `${user.companyName} logo` : ''}
              className="main-user-dropdown-avatar"
              src={user.logoUrl}
            />
          ) : (
            <span className="main-user-dropdown-avatar main-user-avatar--initials">
              {getInitials(displayName)}
            </span>
          )}
          <div className="main-user-dropdown-copy">
            <strong>{displayName}</strong>
            <span>{user.email}</span>
            <small>{metaLabel}</small>
          </div>
        </div>

        <div className="main-user-dropdown-actions" role="none">
          <a
            className="main-user-dropdown-item"
            href={profileHref}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            {labels.profile}
          </a>
          <button
            className="main-user-dropdown-item main-user-dropdown-item--danger"
            onClick={handleLogoutClick}
            role="menuitem"
            type="button"
          >
            {labels.logout}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MainLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showCandidateNotifications = user?.role === 'CANDIDATE'
  const navigationItems = [
    {
      href: '/search',
      label: common.navigation.jobs,
      current: pathname === '/search' || pathname.startsWith('/jobs'),
    },
    {
      href: '/companies',
      label: common.navigation.companies,
      current: pathname === '/companies' || pathname.startsWith('/companies/'),
    },
    {
      href: '/cv-templates',
      label: common.navigation.cvTemplates,
      current: pathname === '/cv-templates',
    },
    {
      href: '/career-guide',
      label: common.navigation.guide,
      current: pathname === '/career-guide',
    },
  ]

  const handleLogout = () => {
    void logout().then(() => {
      toast.success(common.authFeedback.logoutSuccess)
      navigate('/login')
    })
  }

  return (
    <div className="main-shell min-h-screen text-[var(--color-text-primary)]">
      <header className="main-header">
        <div className="main-container main-header-inner flex items-center justify-between gap-5 py-4">
          <a className="main-brand" href="/">
            <BrandMark compact label={common.brandName} />
          </a>
          <nav className="main-nav">
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  ['main-nav-link', isActive || item.current ? 'is-active' : '']
                    .filter(Boolean)
                    .join(' ')
                }
                key={item.href}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="main-header-actions">
            <LanguageSwitch className="main-language-switch" compact />
            {isAuthenticated && user ? (
              <>
                {showCandidateNotifications ? (
                  <UserNotificationPopover
                    buttonClassName="main-notification-button"
                    content={pages.profile.topbar.notifications}
                    fallbackHref="/profile"
                    variant="card"
                  />
                ) : null}
                <MainUserMenu labels={common.authUser} onLogout={handleLogout} user={user} />
              </>
            ) : (
              <>
                <a className="main-employer-link" href="/recruiter/login">
                  {common.navigation.employerCta}
                </a>
                <a className="main-login-link" href="/login">
                  {common.navigation.login}
                </a>
                <a className="main-register-link" href="/register">
                  {common.navigation.register}
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-container py-10 md:py-16">{children}</main>

      <footer className="main-footer">
        <div className="main-container grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a className="main-footer-brand" href="/">
              <BrandMark compact label={common.brandName} />
            </a>
            <p className="main-footer-description mt-4 max-w-sm text-sm leading-6">{common.footer.description}</p>
            <p className="main-footer-support mt-3 text-sm leading-6">
              <span>{common.footer.supportLabel}</span>{' '}
              <a
                className="main-footer-link"
                href={`mailto:${common.footer.supportEmail}`}
              >
                {common.footer.supportEmail}
              </a>
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {common.footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="main-footer-column-title text-sm font-bold">{column.title}</h2>
                <ul className="main-footer-links mt-4 grid gap-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a className="main-footer-link" href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="main-footer-bottom-border">
          <div className="main-footer-bottom main-container flex flex-wrap items-center justify-between gap-4 py-5 text-xs">
            <span className="main-legal-pill">{common.footer.legalLabel}</span>
            <span>{common.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
