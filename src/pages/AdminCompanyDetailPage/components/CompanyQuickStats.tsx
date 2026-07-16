import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { AdminCompany } from '../../AdminCompaniesPage/types'

type CompanyQuickStatsProps = {
  company: AdminCompany
  content: AdminCompaniesTranslations['detail']
}

export function CompanyQuickStats({ company, content }: CompanyQuickStatsProps) {
  return (
    <aside className="admin-company-panel admin-company-quick-stats" aria-labelledby="company-quick-stats-title">
      <header className="admin-company-panel__header">
        <h2 id="company-quick-stats-title">{content.quickStatsTitle}</h2>
      </header>

      <dl className="admin-company-quick-stats__list">
        <div>
          <dt>{content.jobPostsLabel}</dt>
          <dd>{company.stats.jobPosts}</dd>
        </div>
        <div>
          <dt>{content.applicantsLabel}</dt>
          <dd>{company.stats.applicants}</dd>
        </div>
        <div>
          <dt>{content.responseRateLabel}</dt>
          <dd>{company.stats.responseRate}%</dd>
        </div>
      </dl>
    </aside>
  )
}
