import { useParams } from 'react-router-dom'
import { getTranslations } from '../../i18n'
import { CompanyAbout } from './components/CompanyAbout'
import { CompanyCulturePanel } from './components/CompanyCulturePanel'
import { CompanyHero } from './components/CompanyHero'
import { CompanyOpenJobs } from './components/CompanyOpenJobs'
import { CompanySidebar } from './components/CompanySidebar'
import { CompanySnapshot } from './components/CompanySnapshot'
import { findCompanyDetailBySlug } from './utils/companyDetailData'

export function CompanyDetailPage() {
  const { slug = '' } = useParams()
  const { pages } = getTranslations()
  const home = pages.home
  const content = pages.companyDetail
  const company = findCompanyDetailBySlug(home, content, slug)

  if (!company) {
    return (
      <div className="company-detail-page">
        <section className="company-detail-not-found company-detail-motion">
          <span>404</span>
          <h1>{content.notFound.title}</h1>
          <p>{content.notFound.description}</p>
          <a href="/search">{content.notFound.action}</a>
        </section>
      </div>
    )
  }

  return (
    <div className="company-detail-page">
      <a className="company-detail-back-link" href="/search">
        {content.backToSearch}
      </a>

      <CompanyHero company={company} content={content} />
      <CompanySnapshot company={company} content={content.snapshot} />

      <div className="company-detail-layout">
        <main className="company-detail-main">
          <CompanyAbout company={company} content={content.sections} />
          <CompanyCulturePanel company={company} content={content.sections} />
          <CompanyOpenJobs company={company} content={content.openJobs} title={content.sections.openJobs} />
        </main>

        <CompanySidebar company={company} content={content} />
      </div>
    </div>
  )
}

export default CompanyDetailPage
