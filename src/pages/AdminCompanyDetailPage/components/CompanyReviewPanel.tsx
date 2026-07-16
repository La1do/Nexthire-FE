import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'
import type { AdminCompany, CompanyReviewStatus } from '../../AdminCompaniesPage/types'

type CompanyReviewPanelProps = {
  company: AdminCompany
  content: AdminCompaniesTranslations['detail']
  onStatusChange: (status: CompanyReviewStatus) => void
  statusesLabel: AdminCompaniesTranslations['statuses']
}

export function CompanyReviewPanel({
  company,
  content,
  onStatusChange,
  statusesLabel,
}: CompanyReviewPanelProps) {
  const isPending = company.status === 'pending'
  const helperText = company.status === 'approved'
    ? content.approvedHint
    : company.status === 'rejected'
      ? content.rejectedHint
      : content.pendingHint

  return (
    <aside className="admin-company-panel admin-company-review-panel" aria-labelledby="company-review-title">
      <header className="admin-company-panel__header">
        <h2 id="company-review-title">{content.reviewTitle}</h2>
        <CompanyStatusBadge labels={statusesLabel} status={company.status} />
      </header>

      <p className="admin-company-review-panel__hint">{helperText}</p>

      <div className="admin-company-review-panel__actions" role="group">
        <button
          className="admin-company-action admin-company-action--approve"
          disabled={!isPending}
          onClick={() => onStatusChange('approved')}
          type="button"
        >
          {content.approve}
        </button>
        <button
          className="admin-company-action admin-company-action--reject"
          disabled={!isPending}
          onClick={() => onStatusChange('rejected')}
          type="button"
        >
          {content.reject}
        </button>
      </div>
    </aside>
  )
}
