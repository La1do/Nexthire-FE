import type { AdminUsersTranslations } from '../../../i18n/types'
import { ArchiveIcon, BanIcon, RestoreIcon, SuspendIcon, ViewIcon } from '../../../assets/icons/admin'
import { AdminUserAvatar } from '../../_components/admin/AdminUserAvatar'
import { AdminUserRoleBadge } from '../../_components/admin/AdminUserRoleBadge'
import { AdminUserStatusBadge } from '../../_components/admin/AdminUserStatusBadge'
import type { AdminUser, AdminUserAction } from '../types'
import { formatAdminDate } from '../utils/adminUserView'

type Props = {
  actions: AdminUsersTranslations['results']
  columns: AdminUsersTranslations['results']['columns']
  currentUserId?: string
  onAction: (action: AdminUserAction, user: AdminUser) => void
  onView: (user: AdminUser) => void
  rolesLabel: AdminUsersTranslations['roles']
  statusesLabel: AdminUsersTranslations['statuses']
  users: ReadonlyArray<AdminUser>
}

export function AdminUserTable({ actions, columns, currentUserId, onAction, onView, rolesLabel, statusesLabel, users }: Props) {
  return <div className="admin-users-table-wrap"><table className="admin-users-table">
    <caption className="sr-only">{actions.caption}</caption>
    <thead><tr><th>{columns.user}</th><th>{columns.role}</th><th>{columns.status}</th><th>{columns.createdAt}</th><th>{columns.lastActiveAt}</th><th>{columns.actions}</th></tr></thead>
    <tbody>{users.map((user) => {
      const self = user.id === currentUserId
      return <tr key={user.id}>
        <td><div className="admin-user-cell"><AdminUserAvatar avatarUrl={user.avatarUrl} name={user.name} /><div className="admin-user-cell__stack"><p className="admin-user-cell__name" title={user.name}>{user.name}</p><p className="admin-user-cell__email" title={user.email}>{user.email}</p></div></div></td>
        <td><AdminUserRoleBadge label={rolesLabel[user.primaryRole]} role={user.primaryRole} /></td>
        <td><AdminUserStatusBadge label={statusesLabel[user.status]} status={user.status} /></td>
        <td className="admin-users-table__meta">{formatAdminDate(user.createdAt)}</td>
        <td className="admin-users-table__meta">{formatAdminDate(user.lastLoginAt)}</td>
        <td className="admin-users-table__actions">
          <button aria-label={`${actions.actionView}: ${user.name}`} className="admin-user-action admin-user-action--view" onClick={() => onView(user)} title={actions.actionView} type="button"><ViewIcon /><span className="admin-user-action__label">{actions.actionView}</span></button>
          {user.status === 'ACTIVE' ? <>
            <button aria-label={`${actions.actionSuspend}: ${user.name}`} className="admin-user-action admin-user-action--suspend" disabled={self} onClick={() => onAction('suspend', user)} title={actions.actionSuspend} type="button"><SuspendIcon /><span className="admin-user-action__label">{actions.actionSuspend}</span></button>
            <button aria-label={`${actions.actionBan}: ${user.name}`} className="admin-user-action admin-user-action--ban" disabled={self} onClick={() => onAction('ban', user)} title={actions.actionBan} type="button"><BanIcon /><span className="admin-user-action__label">{actions.actionBan}</span></button>
            <button aria-label={`${actions.actionArchive}: ${user.name}`} className="admin-user-action admin-user-action--archive" disabled={self} onClick={() => onAction('archive', user)} title={actions.actionArchive} type="button"><ArchiveIcon /><span className="admin-user-action__label">{actions.actionArchive}</span></button>
          </> : <button aria-label={`${actions.actionRestore}: ${user.name}`} className="admin-user-action admin-user-action--restore" disabled={self} onClick={() => onAction('restore', user)} title={actions.actionRestore} type="button"><RestoreIcon /><span className="admin-user-action__label">{actions.actionRestore}</span></button>}
        </td>
      </tr>
    })}</tbody>
  </table></div>
}
