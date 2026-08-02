import { useParams } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { EmptyState, Loading } from '../_components'
import { CompanyAbout } from './components/CompanyAbout'
import { CompanyCulturePanel } from './components/CompanyCulturePanel'
import { CompanyHero } from './components/CompanyHero'
import { CompanyOpenJobs } from './components/CompanyOpenJobs'
import { CompanySidebar } from './components/CompanySidebar'
import { CompanySnapshot } from './components/CompanySnapshot'
import { useCompanyDetail } from './hooks/useCompanyDetail'
import { useCompanyFollow } from './hooks/useCompanyFollow'

export function CompanyDetailPage() {
  const { id = '' } = useParams()
  const { pages } = useTranslations()
  const content = pages.companyDetail
  const { company, loading, error, notFound } = useCompanyDetail(id)
  const followControl = useCompanyFollow(company?.id ?? '', content.follow)

  if (loading) {
    return (
      <div className="company-detail-page">
        <div className="company-detail-state">
          <Loading label={content.states.loading} />
        </div>
      </div>
    )
  }

  if (notFound) {
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

  if (error || !company) {
    return (
      <div className="company-detail-page">
        <div className="company-detail-state">
          <EmptyState
            description={content.states.errorDescription}
            title={content.states.errorTitle}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="company-detail-page">
      <a className="company-detail-back-link" href="/search">
        {content.backToSearch}
      </a>

      <CompanyHero company={company} content={content} followControl={followControl} />
      <CompanySnapshot company={company} content={content.snapshot} />

      <div className="company-detail-layout">
        <main className="company-detail-main">
          <CompanyAbout company={company} content={content.sections} />
          <CompanyCulturePanel company={company} content={content.sections} />
          <CompanyOpenJobs company={company} content={content.openJobs} title={content.sections.openJobs} />
        </main>

        <CompanySidebar company={company} content={content} followControl={followControl} />
      </div>
    </div>
  )
}

export default CompanyDetailPage
