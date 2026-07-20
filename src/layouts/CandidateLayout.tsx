import type { PropsWithChildren } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslations } from '../i18n'
import { BrandMark, LanguageSwitch } from '../pages/_components'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function CandidateLayout({ children }: PropsWithChildren) {
  const { common, pages } = useTranslations()
  const { pathname } = useLocation()
  const profile = pages.profile
  const navItems = [
    { href: '/search', label: profile.sidebar.searchJobs },
    { href: '/profile/applications', label: profile.sidebar.applications },
    { href: '/profile', label: profile.sidebar.profile },
    { href: '/', label: profile.sidebar.messages },
  ]
  const pageTitle = pathname === '/profile/applications' ? profile.applications.pageTitle : profile.pageTitle

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
          <span>{getInitials(profile.profile.name)}</span>
          <div>
            <strong>{profile.profile.name}</strong>
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
