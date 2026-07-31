import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyFollowControl } from '../hooks/useCompanyFollow'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanySidebarProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations
  followControl: CompanyFollowControl
}

export function CompanySidebar({ company, content, followControl }: CompanySidebarProps) {
  const facts = [
    {
      label: content.sidebar.website,
      value: company.website.replace(/^https?:\/\//, ''),
    },
    {
      label: content.sidebar.industry,
      value: company.industry,
    },
    {
      label: content.sidebar.founded,
      value: company.founded,
    },
    {
      label: content.sidebar.size,
      value: company.size,
    },
  ].filter((fact) => fact.value)

  return (
    <aside className="company-detail-sidebar">
      <div className="company-detail-panel company-detail-motion">
        <h2>{content.sidebar.title}</h2>

        <dl className="company-detail-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="company-detail-side-actions">
          <a href="#company-open-jobs">{content.sidebar.viewJobs}</a>
          {followControl.canRender ? (
            <button
              aria-pressed={followControl.isFollowed}
              className="company-detail-follow-button"
              data-follow-state={
                followControl.isBusy ? 'loading' : followControl.isFollowed ? 'followed' : 'default'
              }
              disabled={followControl.isBusy}
              onClick={followControl.onToggle}
              title={followControl.title}
              type="button"
            >
              {followControl.label}
            </button>
          ) : null}
        </div>
      </div>

      {company.values.length ? (
        <div className="company-detail-panel company-detail-motion">
          <h2>{content.sections.values}</h2>
          <div className="company-detail-chip-list">
            {company.values.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      ) : null}

      {company.perks.length ? (
        <div className="company-detail-panel company-detail-motion">
          <h2>{content.sections.perks}</h2>
          <ul className="company-detail-perk-list">
            {company.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}
