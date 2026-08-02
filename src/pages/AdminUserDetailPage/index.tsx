import { Link, useParams } from 'react-router-dom'
import { useAdminUser } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { AdminUserAvatar } from '../_components/admin/AdminUserAvatar'
import { AdminUserRoleBadge } from '../_components/admin/AdminUserRoleBadge'
import { AdminUserStatusBadge } from '../_components/admin/AdminUserStatusBadge'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { formatAdminDate, toAdminUserView } from '../AdminUsersPage/utils/adminUserView'

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { pages } = useTranslations()
  const content = pages.adminUsers
  const query = useAdminUser(id)

  if (query.isPending) return <div className="admin-users-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={8} /></div>
  if (query.isError || !query.data) return <div className="admin-users-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void query.refetch()} title={content.feedback.errorTitle} /></div>

  const user = toAdminUserView(query.data)
  return <div className="admin-users-page admin-user-detail-page">
    <header className="admin-user-detail-page__header"><Link className="admin-user-detail-page__back" to="/admin/users">← {content.detail.back}</Link><h1>{content.detail.title}</h1></header>
    <section className="admin-dashboard-panel admin-user-detail-card">
      <div className="admin-user-detail-card__identity"><div className="admin-user-detail-card__person"><AdminUserAvatar avatarUrl={user.avatarUrl} name={user.name} size="large" /><div className="admin-user-cell__stack"><h2 title={user.name}>{user.name}</h2><p title={user.email}>{user.email}</p></div></div><div className="admin-user-card__badges"><AdminUserRoleBadge label={content.roles[user.primaryRole]} role={user.primaryRole} /><AdminUserStatusBadge label={content.statuses[user.status]} status={user.status} /></div></div>
      <dl className="admin-user-detail-grid">
        <div><dt>{content.detail.contact}</dt><dd>{user.phone || '—'}</dd></div>
        <div><dt>{content.detail.lastLoginAt}</dt><dd>{formatAdminDate(user.lastLoginAt)}</dd></div>
        <div><dt>{content.detail.company}</dt><dd>{user.company?.companyName || content.detail.noCompany}</dd></div>
        <div><dt>{content.detail.createdAt}</dt><dd>{formatAdminDate(user.createdAt)}</dd></div>
        <div><dt>{content.detail.updatedAt}</dt><dd>{formatAdminDate(user.updatedAt)}</dd></div>
        <div><dt>{content.detail.statusReason}</dt><dd>{user.statusReason || '—'}</dd></div>
        <div><dt>{content.detail.changedAt}</dt><dd>{formatAdminDate(user.statusChangedAt)}</dd></div>
        <div><dt>Email</dt><dd>{user.emailVerified ? content.detail.emailVerified : content.detail.emailUnverified}</dd></div>
      </dl>
    </section>
  </div>
}

export default AdminUserDetailPage
