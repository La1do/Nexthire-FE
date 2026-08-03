import type { AdminUsersTranslations } from '../../../i18n/types'
import { ArchiveIcon, BanIcon, RestoreIcon, SuspendIcon, ViewIcon } from '../../../assets/icons/admin'
import { AdminUserAvatar } from '../../_components/admin/AdminUserAvatar'
import { AdminUserRoleBadge } from '../../_components/admin/AdminUserRoleBadge'
import { AdminUserStatusBadge } from '../../_components/admin/AdminUserStatusBadge'
import type { AdminUser, AdminUserAction } from '../types'
import { formatAdminDate } from '../utils/adminUserView'
import { AdminUserActionMenu } from './AdminUserActionMenu'

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
    <colgroup><col /><col /><col /><col /><col /><col className="admin-users-table__actions-col" /></colgroup>
    <thead><tr><th>{columns.user}</th><th>{columns.role}</th><th>{columns.status}</th><th>{columns.createdAt}</th><th>{columns.lastActiveAt}</th><th>{columns.actions}</th></tr></thead>
    <tbody>{users.map((user) => {
      const self = user.id === currentUserId
      return <tr key={user.id}>
        <td><div className="admin-user-cell"><AdminUserAvatar avatarUrl={user.avatarUrl} name={user.name} /><div className="admin-user-cell__stack"><p className="admin-user-cell__name" title={user.name}>{user.name}</p><p className="admin-user-cell__email" title={user.email}>{user.email}</p></div></div></td>
        <td><AdminUserRoleBadge label={rolesLabel[user.primaryRole]} role={user.primaryRole} /></td>
        <td><AdminUserStatusBadge label={statusesLabel[user.status]} status={user.status} /></td>
        <td className="admin-users-table__meta">{formatAdminDate(user.createdAt)}</td>
        <td className="admin-users-table__meta">{formatAdminDate(user.lastLoginAt)}</td>
        <td className="admin-users-table__actions-cell"><div className="admin-users-table__actions"><AdminUserActionMenu label={`${columns.actions}: ${user.name}`} items={[
          { icon: <ViewIcon />, label: actions.actionView, onClick: () => onView(user) },
          ...(user.status === 'ACTIVE' ? [
            { disabled: self, icon: <SuspendIcon />, label: actions.actionSuspend, onClick: () => onAction('suspend', user), tone: 'warning' as const },
            { disabled: self, icon: <BanIcon />, label: actions.actionBan, onClick: () => onAction('ban', user), tone: 'danger' as const },
            { disabled: self, icon: <ArchiveIcon />, label: actions.actionArchive, onClick: () => onAction('archive', user), tone: 'danger' as const },
          ] : [{ disabled: self, icon: <RestoreIcon />, label: actions.actionRestore, onClick: () => onAction('restore', user), tone: 'success' as const }]),
        ]} /></div></td>
      </tr>
    })}</tbody>
  </table></div>
}
