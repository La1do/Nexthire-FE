import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'
import type { AdminCompany } from '../types'

type CompanyReviewMobileListHandlers = {
  onApprove: (company: AdminCompany) => void
  onReject: (company: AdminCompany) => void
}

type CompanyReviewMobileListProps = {
  actions: AdminCompaniesTranslations['results']['actions']
  columns: AdminCompaniesTranslations['results']['columns']
  companies: ReadonlyArray<AdminCompany>
  handlers: CompanyReviewMobileListHandlers
  statusesLabel: AdminCompaniesTranslations['statuses']
}

export function CompanyReviewMobileList({
  actions,
  columns,
  companies,
  handlers,
  statusesLabel,
}: CompanyReviewMobileListProps) {
  return (
    <ul className="admin-company-mobile-list">
      {companies.map((company) => (
        <li className="admin-company-card" key={company.id}>
          <div className="admin-company-cell">
            <span aria-hidden="true" className="admin-company-cell__logo">{company.logoText}</span>
            <div>
              <p className="admin-company-cell__name">{company.name}</p>
              <a className="admin-company-cell__website" href={company.website} rel="noreferrer" target="_blank">
                {company.website}
              </a>
            </div>
          </div>

          <dl className="admin-company-card__meta">
            <div>
              <dt>{columns.submittedAt}</dt>
              <dd>{company.submittedAt}</dd>
            </div>
            <div>
              <dt>{columns.status}</dt>
              <dd>
                <CompanyStatusBadge labels={statusesLabel} status={company.status} />
              </dd>
            </div>
          </dl>

          <div className="admin-company-card__actions" role="group">
            <a className="admin-company-action admin-company-action--ghost" href={`/admin/companies/${company.id}`}>
              {actions.viewDetail}
            </a>
            {company.status === 'approved' ? (
              <span className="admin-company-action admin-company-action--verified">
                {actions.verified}
              </span>
            ) : null}
            {company.status === 'pending' ? (
              <>
                <button
                  className="admin-company-action admin-company-action--approve"
                  onClick={() => handlers.onApprove(company)}
                  type="button"
                >
                  {actions.approve}
                </button>
                <button
                  className="admin-company-action admin-company-action--reject"
                  onClick={() => handlers.onReject(company)}
                  type="button"
                >
                  {actions.reject}
                </button>
              </>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
