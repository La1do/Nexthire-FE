import { useParams } from 'react-router-dom'
import { BadgeCheck, Building2, CalendarDays, Clock3, Mail, Phone, ShieldAlert, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAdminUser } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { AdminUserAvatar } from '../_components/admin/AdminUserAvatar'
import { AdminUserRoleBadge } from '../_components/admin/AdminUserRoleBadge'
import { AdminUserStatusBadge } from '../_components/admin/AdminUserStatusBadge'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { formatAdminDate, toAdminUserView } from '../AdminUsersPage/utils/adminUserView'
import './admin-user-detail-page.css'

type DetailItemProps = {
  icon: ReactNode
  label: string
  value: string
  muted?: boolean
}

function DetailItem({ icon, label, value, muted = false }: DetailItemProps) {
  return (
    <div className={`admin-user-detail-item${muted ? ' is-muted' : ''}`}>
      <span aria-hidden="true" className="admin-user-detail-item__icon">{icon}</span>
      <div>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    </div>
  )
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { pages } = useTranslations()
  const content = pages.adminUsers
  const query = useAdminUser(id)

  if (query.isPending) return <div className="admin-users-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={8} /></div>
  if (query.isError || !query.data) return <div className="admin-users-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void query.refetch()} title={content.feedback.errorTitle} /></div>

  const user = toAdminUserView(query.data)
  const emailVerification = user.emailVerified ? content.detail.emailVerified : content.detail.emailUnverified
  return <div className="admin-users-page admin-user-detail-page">
    <header className="admin-user-detail-page__header">
      <div><p>{content.detail.routeLabel}</p><h1>{content.detail.title}</h1></div>
    </header>

    <section className="admin-user-detail-hero">
      <div className="admin-user-detail-hero__identity">
        <AdminUserAvatar avatarUrl={user.avatarUrl} name={user.name} size="large" />
        <div className="admin-user-detail-hero__person">
          <h2 title={user.name}>{user.name}</h2>
          <p title={user.email}>{user.email}</p>
          <div className="admin-user-card__badges"><AdminUserRoleBadge label={content.roles[user.primaryRole]} role={user.primaryRole} /><AdminUserStatusBadge label={content.statuses[user.status]} status={user.status} /></div>
        </div>
      </div>
      <div className="admin-user-detail-hero__facts" aria-label={content.detail.title}>
        <div><span>{content.detail.lastLoginAt}</span><strong>{formatAdminDate(user.lastLoginAt)}</strong></div>
        <div><span>{content.detail.createdAt}</span><strong>{formatAdminDate(user.createdAt)}</strong></div>
        <div><span>{content.detail.contact}</span><strong>{user.phone || '—'}</strong></div>
      </div>
    </section>

    <div className="admin-user-detail-sections">
      <section className="admin-user-detail-section">
        <header><div><span aria-hidden="true"><UserRound /></span><div><h2>{content.detail.contact}</h2><p>{content.detail.contactDescription}</p></div></div></header>
        <dl className="admin-user-detail-section__list">
          <DetailItem icon={<Mail />} label="Email" value={user.email} />
          <DetailItem icon={<Phone />} label={content.detail.contact} value={user.phone || content.detail.phoneNotProvided} muted={!user.phone} />
          <DetailItem icon={<Building2 />} label={content.detail.company} value={user.company?.companyName || content.detail.noCompany} muted={!user.company?.companyName} />
        </dl>
      </section>

      <section className="admin-user-detail-section">
        <header><div><span aria-hidden="true"><ShieldAlert /></span><div><h2>{content.detail.lifecycle}</h2><p>{content.detail.lifecycleDescription}</p></div></div></header>
        <dl className="admin-user-detail-section__list">
          <DetailItem icon={<BadgeCheck />} label="Email" value={emailVerification} />
          <DetailItem icon={<ShieldAlert />} label={content.detail.statusReason} value={user.statusReason || content.detail.statusReasonNotProvided} muted={!user.statusReason} />
        </dl>
      </section>

      <section className="admin-user-detail-section admin-user-detail-section--timeline">
        <header><div><span aria-hidden="true"><CalendarDays /></span><div><h2>{content.detail.timeline}</h2><p>{content.detail.timelineDescription}</p></div></div></header>
        <dl className="admin-user-detail-section__list">
          <DetailItem icon={<CalendarDays />} label={content.detail.createdAt} value={formatAdminDate(user.createdAt)} />
          <DetailItem icon={<Clock3 />} label={content.detail.updatedAt} value={formatAdminDate(user.updatedAt)} />
          <DetailItem icon={<Clock3 />} label={content.detail.changedAt} value={formatAdminDate(user.statusChangedAt)} muted={!user.statusChangedAt} />
          <DetailItem icon={<Clock3 />} label={content.detail.lastLoginAt} value={formatAdminDate(user.lastLoginAt)} muted={!user.lastLoginAt} />
        </dl>
      </section>
    </div>
  </div>
}

export default AdminUserDetailPage
