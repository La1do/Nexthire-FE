import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyCulturePanelProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['sections']
}

export function CompanyCulturePanel({ company, content }: CompanyCulturePanelProps) {
  if (!company.culture) {
    return null
  }

  return (
    <section className="company-detail-panel company-detail-culture-text company-detail-motion">
      <div className="company-detail-section-heading">
        <h2>{content.culture}</h2>
      </div>

      <p>{company.culture}</p>
    </section>
  )
}
