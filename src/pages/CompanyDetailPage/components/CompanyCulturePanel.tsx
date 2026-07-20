import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyCulturePanelProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['sections']
}

export function CompanyCulturePanel({ company, content }: CompanyCulturePanelProps) {
  return (
    <section className="company-detail-panel company-detail-motion">
      <div className="company-detail-section-heading">
        <h2>{content.culture}</h2>
      </div>

      <div className="company-detail-culture-grid">
        {company.culture.map((item) => (
          <article className={`company-detail-culture-card company-detail-culture-card-${item.tone}`} key={item.title}>
            <span>{item.title}</span>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
