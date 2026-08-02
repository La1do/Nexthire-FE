import type { AdminUsersTranslations } from '../../../i18n/types'
import type { AdminUserStatus } from '../../../types/admin.types'

const statuses: AdminUserStatus[] = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'LOCKED',
  'BANNED',
  'ARCHIVED',
]

type AdminUserStatusOverviewProps = {
  activeStatus: AdminUserStatus | 'all'
  content: AdminUsersTranslations['statusOverview']
  counts: Record<AdminUserStatus, number>
  onStatusChange: (status: AdminUserStatus) => void
  statusLabels: AdminUsersTranslations['statuses']
  total: number
}

export function AdminUserStatusOverview({
  activeStatus,
  content,
  counts,
  onStatusChange,
  statusLabels,
  total,
}: AdminUserStatusOverviewProps) {
  return (
    <section className="admin-user-status-overview">
      <header className="admin-user-status-overview__header">
        <div>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <strong>{content.totalLabel.replace('{{count}}', String(total))}</strong>
      </header>

      <div
        aria-label={content.distributionLabel}
        className="admin-user-status-overview__bar"
        role="img"
      >
        {statuses.map((status) => {
          const percentage = total > 0 ? (counts[status] / total) * 100 : 0
          return percentage > 0 ? (
            <span
              className={`admin-user-status-overview__segment is-${status.toLowerCase()}`}
              key={status}
              style={{ width: `${percentage}%` }}
              title={`${statusLabels[status]}: ${counts[status]}`}
            />
          ) : null
        })}
      </div>

      <div className="admin-user-status-overview__items">
        {statuses.map((status) => {
          const selected = activeStatus === status
          return (
            <button
              aria-pressed={selected}
              className={`admin-user-status-item is-${status.toLowerCase()}${selected ? ' is-selected' : ''}`}
              key={status}
              onClick={() => onStatusChange(status)}
              type="button"
            >
              <span aria-hidden="true" className="admin-user-status-item__dot" />
              <span className="admin-user-status-item__label">{statusLabels[status]}</span>
              <strong>{counts[status]}</strong>
            </button>
          )
        })}
      </div>
    </section>
  )
}
