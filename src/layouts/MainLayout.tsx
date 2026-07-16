import type { PropsWithChildren } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAuthUserDisplayName,
  getInitials,
  useAuth,
} from '../context'
import type { AuthApiRole } from '../lib/auth/authRole'
import { getTranslations } from '../i18n'

function getRoleLabel(
  role: AuthApiRole,
  labels: { candidateRole: string; recruiterRole: string; adminRole: string },
) {
  if (role === 'CANDIDATE') return labels.candidateRole
  if (role === 'RECRUITER') return labels.recruiterRole
  return labels.adminRole
}

export function MainLayout({ children }: PropsWithChildren) {
  const { common } = getTranslations()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="main-shell min-h-screen text-[var(--color-text-primary)]">
      <header className="main-header">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-5 px-5 py-4">
          <a className="main-brand" href="/">
            {common.brandName}
          </a>
          <nav className="main-nav">
            <a href="/">
              {common.navigation.jobs}
            </a>
            <a href="/">
              {common.navigation.companies}
            </a>
            <a href="/">
              {common.navigation.guide}
            </a>
          </nav>
          <div className="main-header-actions">
            {isAuthenticated && user ? (
              <div className="main-user-menu">
                <div className="main-user-copy">
                  {user.logoUrl ? (
                    <img
                      alt=""
                      className="main-user-avatar"
                      src={user.logoUrl}
                    />
                  ) : (
                    <span className="main-user-avatar main-user-avatar--initials">
                      {getInitials(getAuthUserDisplayName(user))}
                    </span>
                  )}
                  <span className="main-user-meta">
                    <strong>{getAuthUserDisplayName(user)}</strong>
                    <small>{getRoleLabel(user.role, common.authUser)}</small>
                  </span>
                </div>
                <div className="main-user-actions">
                  <a className="main-user-action main-user-action--profile" href="/profile">
                    {common.authUser.profile}
                  </a>
                  <button
                    className="main-user-action main-user-action--logout"
                    onClick={handleLogout}
                    type="button"
                  >
                    {common.authUser.logout}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a className="main-employer-link" href="/">
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

      <main className="mx-auto w-full max-w-6xl px-5 py-10 md:py-16">{children}</main>

      <footer className="main-footer">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a className="main-footer-brand" href="/">
              {common.brandName}
            </a>
            <p className="main-footer-description mt-4 max-w-sm text-sm leading-6">{common.footer.description}</p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {common.footer.columns.map((column) => (
              <div key={column.title}>
                <h2 className="main-footer-column-title text-sm font-bold">{column.title}</h2>
                <ul className="main-footer-links mt-4 grid gap-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a className="main-footer-link" href="/">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="main-footer-bottom-border">
          <div className="main-footer-bottom mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs">
            <span className="main-legal-pill">{common.footer.legalLabel}</span>
            <span>{common.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
