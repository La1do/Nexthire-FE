import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'
import type { AdminCompany } from '../../AdminCompaniesPage/types'

type CompanyOverviewCardProps = {
  company: AdminCompany
  content: AdminCompaniesTranslations['detail']
  statusesLabel: AdminCompaniesTranslations['statuses']
}

export function CompanyOverviewCard({ company, content, statusesLabel }: CompanyOverviewCardProps) {
  return (
    <section className="admin-company-panel admin-company-overview" aria-labelledby="company-overview-title">
      <div className="admin-company-overview__head">
        <span aria-hidden="true" className="admin-company-overview__logo">{company.logoText}</span>
        <div>
          <div className="admin-company-overview__title-row">
            <h2 id="company-overview-title">{company.name}</h2>
            <CompanyStatusBadge labels={statusesLabel} status={company.status} />
          </div>
          <a className="admin-company-overview__website" href={company.website} rel="noreferrer" target="_blank">
            {company.website}
          </a>
        </div>
      </div>

      <dl className="admin-company-overview__meta">
        <div>
          <dt>{content.taxCodeLabel}</dt>
          <dd>{company.taxCode}</dd>
        </div>
        <div>
          <dt>{content.submittedAtLabel}</dt>
          <dd>{company.submittedAt}</dd>
        </div>
        <div className="admin-company-overview__wide">
          <dt>{content.addressLabel}</dt>
          <dd>{company.address}</dd>
        </div>
      </dl>
    </section>
  )
}
