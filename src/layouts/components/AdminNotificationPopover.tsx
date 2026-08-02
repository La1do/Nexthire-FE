import { useNavigate } from 'react-router-dom'
import { BellIcon } from '../../assets/icons/admin'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import type { AdminUsersTranslations } from '../../i18n/types'
import type { AdminNotification } from '../../services/admin'

type Props = { content: AdminUsersTranslations['topbar']; isOpen: boolean; onToggle: () => void }
function routeFor(item: AdminNotification) {
  if (item.type === 'ADMIN_COMPANY_REVIEW_REQUIRED') return '/admin/companies?status=PENDING'
  if (item.type === 'ADMIN_JOB_REVIEW_REQUIRED') return '/admin/jobs?tab=review'
  if (item.type === 'ADMIN_JOB_REVISION_REVIEW_REQUIRED') return '/admin/jobs?tab=revisions'
  if (item.type === 'ADMIN_USER_RISK_DETECTED' && item.data?.userId) return `/admin/users/${item.data.userId}`
  return '/admin/dashboard'
}

export function AdminNotificationPopover({ content, isOpen, onToggle }: Props) {
  const navigate = useNavigate()
  const { list, markAll, markRead, unread } = useAdminNotifications(isOpen)
  return <div className="admin-topbar-popover-wrap">
    <button aria-expanded={isOpen} aria-label={content.notificationsLabel} className="admin-topbar__icon-button" onClick={onToggle} type="button">
      <BellIcon />
      {(unread.data ?? 0) > 0 ? <span className="admin-topbar__badge">{Math.min(unread.data ?? 0, 99)}</span> : null}
    </button>
    {isOpen ? <section className="admin-notification-popover">
      <header><h2>{content.notificationTitle}</h2><button disabled={!unread.data || markAll.isPending} onClick={() => markAll.mutate()} type="button">{content.markAllRead}</button></header>
      {list.isPending ? <div className="admin-popover-state">{content.notificationLoading}</div> : list.isError ? <div className="admin-popover-state">{content.notificationError}</div> : !list.data?.data.length ? <div className="admin-popover-state">{content.notificationEmpty}</div> : <ul>{list.data.data.map((item) => <li className={item.readAt ? '' : 'is-unread'} key={item.id}><button onClick={() => { if (!item.readAt) markRead.mutate(item.id); navigate(routeFor(item)); onToggle() }} type="button"><strong>{item.title}</strong><span>{item.body}</span><time>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</time></button></li>)}</ul>}
    </section> : null}
  </div>
}
