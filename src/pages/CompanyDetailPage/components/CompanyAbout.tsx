import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyAboutProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['sections']
}

export function CompanyAbout({ company, content }: CompanyAboutProps) {
  const aboutClassName = company.mission
    ? 'company-detail-panel company-detail-about company-detail-motion'
    : 'company-detail-panel company-detail-about company-detail-about-single company-detail-motion'

  return (
    <section className={aboutClassName}>
      <div>
        <h2>{content.about}</h2>
        <p>{company.description}</p>
      </div>
      {company.mission ? (
        <div>
          <h2>{content.mission}</h2>
          <p>{company.mission}</p>
        </div>
      ) : null}
    </section>
  )
}
