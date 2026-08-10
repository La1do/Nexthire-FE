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

export function AdminUserMobileList({ actions, columns, currentUserId, onAction, onView, rolesLabel, statusesLabel, users }: Props) {
  return <ul className="admin-users-mobile-list">{users.map((user) => {
    const self = user.id === currentUserId
    return <li className="admin-user-card" key={user.id}>
      <div className="admin-user-cell"><AdminUserAvatar avatarUrl={user.avatarUrl} name={user.name} /><div className="admin-user-cell__stack"><p className="admin-user-cell__name" title={user.name}>{user.name}</p><p className="admin-user-cell__email" title={user.email}>{user.email}</p></div></div>
      <div className="admin-user-card__badges"><AdminUserRoleBadge label={rolesLabel[user.primaryRole]} role={user.primaryRole} /><AdminUserStatusBadge label={statusesLabel[user.status]} status={user.status} /></div>
      <dl className="admin-user-card__meta"><div><dt>{columns.createdAt}</dt><dd>{formatAdminDate(user.createdAt)}</dd></div><div><dt>{columns.lastActiveAt}</dt><dd>{formatAdminDate(user.lastLoginAt)}</dd></div></dl>
      <div className="admin-user-card__actions">
        <button className="admin-mobile-action" onClick={() => onView(user)} type="button"><ViewIcon />{actions.actionView}</button>
        {user.status === 'ACTIVE' ? <>
          <button className="admin-mobile-action" disabled={self} onClick={() => onAction('suspend', user)} type="button"><SuspendIcon />{actions.actionSuspend}</button>
          <button className="admin-mobile-action admin-mobile-action--delete" disabled={self} onClick={() => onAction('ban', user)} type="button"><BanIcon />{actions.actionBan}</button>
          <button className="admin-mobile-action" disabled={self} onClick={() => onAction('archive', user)} type="button"><ArchiveIcon />{actions.actionArchive}</button>
        </> : <button className="admin-mobile-action admin-mobile-action--unlock" disabled={self} onClick={() => onAction('restore', user)} type="button"><RestoreIcon />{actions.actionRestore}</button>}
      </div>
    </li>
  })}</ul>
}
