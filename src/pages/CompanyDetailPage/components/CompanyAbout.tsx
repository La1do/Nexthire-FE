import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyAboutProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['sections']
}

export function CompanyAbout({ company, content }: CompanyAboutProps) {
  return (
    <section className="company-detail-panel company-detail-about company-detail-motion">
      <div>
        <h2>{content.about}</h2>
        <p>{company.description}</p>
      </div>
      <div>
        <h2>{content.mission}</h2>
        <p>{company.mission}</p>
      </div>
    </section>
  )
}
