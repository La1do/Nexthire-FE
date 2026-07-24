import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'
import { getAuthUserDisplayName, getInitials, useAuth } from '../context'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'

export function CandidateLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const profile = pages.profile
  const candidateSettings = pages.candidateSettings
  const userDisplayName = user ? getAuthUserDisplayName(user) : common.brandName
  const navItems = [
    { href: '/search', label: profile.sidebar.searchJobs },
    { href: '/profile/applications', label: profile.sidebar.applications },
    { href: '/profile/saved-jobs', label: profile.sidebar.savedJobs },
    { href: '/profile', label: profile.sidebar.profile },
    { href: '/profile/messages', label: profile.sidebar.messages },
    { href: '/profile/settings', label: candidateSettings.routeLabel },
  ]
  const pageTitle =
    pathname === '/profile/applications'
      ? profile.applications.pageTitle
      : pathname === '/profile/saved-jobs'
        ? profile.savedJobs.pageTitle
        : pathname === '/profile/settings'
          ? candidateSettings.pageTitle
          : profile.pageTitle

  return (
    <div className="candidate-shell">
      <aside className="candidate-sidebar">
        <a className="candidate-brand" href="/">
          <BrandMark label={common.brandName} />
        </a>

        <nav aria-label={profile.routeLabel} className="candidate-nav">
          {navItems.map((item) => (
            <a aria-current={pathname === item.href ? 'page' : undefined} href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="candidate-sidebar-user">
          <span>{getInitials(userDisplayName)}</span>
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
            <button aria-label={profile.topbar.notificationsLabel} className="candidate-icon-button" type="button" />
            <a href="/login">{profile.topbar.logout}</a>
          </div>
        </header>

        <main className="candidate-content">{children}</main>
      </div>
    </div>
  )
}
