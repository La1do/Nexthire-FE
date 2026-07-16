import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { CompanyReviewStatus } from '../../AdminCompaniesPage/types'

type CompanyStatusBadgeProps = {
  labels: AdminCompaniesTranslations['statuses']
  status: CompanyReviewStatus
}

function getCompanyStatusLabel(
  status: CompanyReviewStatus,
  labels: AdminCompaniesTranslations['statuses'],
) {
  if (status === 'approved') return labels.approved
  if (status === 'rejected') return labels.rejected
  return labels.pending
}

export function CompanyStatusBadge({ labels, status }: CompanyStatusBadgeProps) {
  return (
    <span className={`admin-badge admin-badge--company-${status}`}>
      {getCompanyStatusLabel(status, labels)}
    </span>
  )
}
