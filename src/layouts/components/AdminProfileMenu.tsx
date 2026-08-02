import { useNavigate } from 'react-router-dom'
import type { AdminUsersTranslations } from '../../i18n/types'
import type { AuthUser } from '../../services/auth.service'

type Props = { content: AdminUsersTranslations['topbar']; isOpen: boolean; onLogout: () => void; onToggle: () => void; user: AuthUser | null }
function initials(value: string) { const parts = value.trim().split(/\s+/); return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase() || 'A' }
export function AdminProfileMenu({ content, isOpen, onLogout, onToggle, user }: Props) {
  const navigate = useNavigate(); const name = user?.fullName || user?.email || content.adminRole
  return <div className="admin-topbar-popover-wrap"><button aria-expanded={isOpen} aria-label={content.profileLabel} className="admin-topbar__icon-button" onClick={onToggle} type="button">{user?.avatarUrl ? <img alt="" src={user.avatarUrl} /> : <span className="admin-topbar-profile-initials">{initials(name)}</span>}</button>{isOpen ? <section className="admin-profile-popover"><header><strong>{name}</strong><span>{user?.email}</span><em>{content.adminRole}</em></header><button onClick={() => { navigate('/admin/settings'); onToggle() }} type="button">{content.profileSettings}</button><button className="is-danger" onClick={onLogout} type="button">{content.profileLogout}</button></section> : null}</div>
}
