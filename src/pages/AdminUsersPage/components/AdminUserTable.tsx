import type { AdminUsersTranslations } from '../../../i18n/types'
import type { AdminUser } from '../types'
import { AdminUserBadge } from './AdminUserBadge'

type AdminUserTableHandlers = {
  onDelete: (user: AdminUser) => void
  onLock: (user: AdminUser) => void
  onUnlock: (user: AdminUser) => void
  onView: (user: AdminUser) => void
}

type AdminUserTableProps = {
  rolesLabel: AdminUsersTranslations['roles']
  statusesLabel: AdminUsersTranslations['statuses']
  users: ReadonlyArray<AdminUser>
  columns: AdminUsersTranslations['results']['columns']
  actions: AdminUsersTranslations['results']
  handlers: AdminUserTableHandlers
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

function ViewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
    </svg>
  )
}

function getRoleLabel(role: AdminUser['role'], rolesLabel: AdminUsersTranslations['roles']) {
  return role === 'admin' ? rolesLabel.admin : role === 'employer' ? rolesLabel.employer : rolesLabel.candidate
}

function getStatusLabel(status: AdminUser['status'], statusesLabel: AdminUsersTranslations['statuses']) {
  return status === 'locked' ? statusesLabel.locked : status === 'invited' ? statusesLabel.invited : statusesLabel.active
}

export function AdminUserTable({
  users,
  rolesLabel,
  statusesLabel,
  columns,
  actions,
  handlers,
}: AdminUserTableProps) {
  return (
    <div className="admin-users-table-wrap">
      <table className="admin-users-table">
        <caption className="sr-only">{actions.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{columns.user}</th>
            <th scope="col">{columns.role}</th>
            <th scope="col">{columns.status}</th>
            <th scope="col">{columns.createdAt}</th>
            <th scope="col">{columns.lastActiveAt}</th>
            <th scope="col" className="admin-users-table__actions-col">{columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="admin-user-cell">
                  <span aria-hidden="true" className="admin-user-cell__avatar">{getInitials(user.name)}</span>
                  <div>
                    <p className="admin-user-cell__name">{user.name}</p>
                    <p className="admin-user-cell__email">{user.email}</p>
                  </div>
                </div>
              </td>
              <td>
                <AdminUserBadge tone={getRoleTone(user.role)}>{getRoleLabel(user.role, rolesLabel)}</AdminUserBadge>
              </td>
              <td>
                <AdminUserBadge tone={getStatusTone(user.status)}>{getStatusLabel(user.status, statusesLabel)}</AdminUserBadge>
              </td>
              <td className="admin-users-table__meta">{user.createdAt}</td>
              <td className="admin-users-table__meta">{user.lastActiveAt}</td>
              <td className="admin-users-table__actions">
                <button
                  aria-label={`${actions.actionView}: ${user.name}`}
                  className="admin-icon-button admin-icon-button--view"
                  onClick={() => handlers.onView(user)}
                  type="button"
                  title={actions.actionView}
                >
                  <ViewIcon />
                </button>
                {user.status === 'locked' ? (
                  <button
                    aria-label={`${actions.actionUnlock}: ${user.name}`}
                    className="admin-icon-button admin-icon-button--unlock"
                    onClick={() => handlers.onUnlock(user)}
                    type="button"
                    title={actions.actionUnlock}
                  >
                    <UnlockIcon />
                  </button>
                ) : (
                  <button
                    aria-label={`${actions.actionLock}: ${user.name}`}
                    className="admin-icon-button admin-icon-button--lock"
                    onClick={() => handlers.onLock(user)}
                    type="button"
                    title={actions.actionLock}
                  >
                    <LockIcon />
                  </button>
                )}
                <button
                  aria-label={`${actions.actionDelete}: ${user.name}`}
                  className="admin-icon-button admin-icon-button--delete"
                  onClick={() => handlers.onDelete(user)}
                  type="button"
                  title={actions.actionDelete}
                >
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
