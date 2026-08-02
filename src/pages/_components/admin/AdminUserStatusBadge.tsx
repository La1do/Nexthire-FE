import type { AdminUserStatus } from '../../../types/admin.types'

type AdminUserStatusBadgeProps = {
  label: string
  status: AdminUserStatus
}

export function AdminUserStatusBadge({ label, status }: AdminUserStatusBadgeProps) {
  return (
    <span className={`admin-user-status-badge is-${status.toLowerCase()}`} title={label}>
      <span aria-hidden="true" className="admin-user-status-badge__dot" />
      <span>{label}</span>
    </span>
  )
}
