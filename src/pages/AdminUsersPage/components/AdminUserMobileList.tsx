import type { AdminUsersTranslations } from '../../../i18n/types'
import type { AdminUser } from '../types'
import { AdminUserBadge } from './AdminUserBadge'

type AdminUserMobileListHandlers = {
  onDelete: (user: AdminUser) => void
  onLock: (user: AdminUser) => void
  onUnlock: (user: AdminUser) => void
  onView: (user: AdminUser) => void
}

type AdminUserMobileListProps = {
  actions: AdminUsersTranslations['results']
  columns: AdminUsersTranslations['results']['columns']
  handlers: AdminUserMobileListHandlers
  rolesLabel: AdminUsersTranslations['roles']
  statusesLabel: AdminUsersTranslations['statuses']
  users: ReadonlyArray<AdminUser>
}

function getRoleTone(role: AdminUser['role']) {
  return role === 'admin' ? 'admin' : role === 'employer' ? 'employer' : 'candidate'
}

function getStatusTone(status: AdminUser['status']) {
  return status === 'locked' ? 'locked' : status === 'invited' ? 'invited' : 'active'
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

function getRoleLabel(role: AdminUser['role'], rolesLabel: AdminUsersTranslations['roles']) {
  return role === 'admin' ? rolesLabel.admin : role === 'employer' ? rolesLabel.employer : rolesLabel.candidate
}

function getStatusLabel(status: AdminUser['status'], statusesLabel: AdminUsersTranslations['statuses']) {
  return status === 'locked' ? statusesLabel.locked : status === 'invited' ? statusesLabel.invited : statusesLabel.active
}

export function AdminUserMobileList({
  users,
  columns,
  actions,
  handlers,
  rolesLabel,
  statusesLabel,
}: AdminUserMobileListProps) {
  return (
    <ul className="admin-users-mobile-list">
      {users.map((user) => (
        <li className="admin-user-card" key={user.id}>
          <div className="admin-user-cell">
            <span aria-hidden="true" className="admin-user-cell__avatar">{getInitials(user.name)}</span>
            <div className="admin-user-cell__stack">
              <p className="admin-user-cell__name">{user.name}</p>
              <p className="admin-user-cell__email">{user.email}</p>
            </div>
          </div>

          <div className="admin-user-card__badges">
            <AdminUserBadge tone={getRoleTone(user.role)}>{getRoleLabel(user.role, rolesLabel)}</AdminUserBadge>
            <AdminUserBadge tone={getStatusTone(user.status)}>{getStatusLabel(user.status, statusesLabel)}</AdminUserBadge>
          </div>

          <dl className="admin-user-card__meta">
            <div>
              <dt>{columns.createdAt}</dt>
              <dd>{user.createdAt}</dd>
            </div>
            <div>
              <dt>{columns.lastActiveAt}</dt>
              <dd>{user.lastActiveAt}</dd>
            </div>
          </dl>

          <div className="admin-user-card__actions" role="group">
            <button
              aria-label={`${actions.actionView}: ${user.name}`}
              className="admin-mobile-action"
              onClick={() => handlers.onView(user)}
              type="button"
            >
              {actions.actionView}
            </button>
            {user.status === 'locked' ? (
              <button
                aria-label={`${actions.actionUnlock}: ${user.name}`}
                className="admin-mobile-action admin-mobile-action--unlock"
                onClick={() => handlers.onUnlock(user)}
                type="button"
              >
                {actions.actionUnlock}
              </button>
            ) : (
              <button
                aria-label={`${actions.actionLock}: ${user.name}`}
                className="admin-mobile-action admin-mobile-action--lock"
                onClick={() => handlers.onLock(user)}
                type="button"
              >
                {actions.actionLock}
              </button>
            )}
            <button
              aria-label={`${actions.actionDelete}: ${user.name}`}
              className="admin-mobile-action admin-mobile-action--delete"
              onClick={() => handlers.onDelete(user)}
              type="button"
            >
              {actions.actionDelete}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
