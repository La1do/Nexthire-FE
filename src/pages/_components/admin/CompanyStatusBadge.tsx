import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { CompanyStatus } from '../../../types/admin.types'
import { ApproveIcon, PendingIcon, RejectIcon, SuspendIcon } from '../../../assets/icons/admin'

type CompanyStatusBadgeProps = {
  labels: AdminCompaniesTranslations['statuses']
  status: CompanyStatus
}

function getCompanyStatusLabel(
  status: CompanyStatus,
  labels: AdminCompaniesTranslations['statuses'],
) {
  if (status === 'APPROVED') return labels.approved
  if (status === 'REJECTED') return labels.rejected
  if (status === 'SUSPENDED') return labels.suspended
  return labels.pending
}

export function CompanyStatusBadge({ labels, status }: CompanyStatusBadgeProps) {
  const StatusIcon = status === 'APPROVED'
    ? ApproveIcon
    : status === 'REJECTED'
      ? RejectIcon
      : status === 'SUSPENDED'
        ? SuspendIcon
        : PendingIcon

  return (
    <span className={`admin-badge admin-badge--company-${status.toLowerCase()}`}>
      <StatusIcon />
      {getCompanyStatusLabel(status, labels)}
    </span>
  )
}
