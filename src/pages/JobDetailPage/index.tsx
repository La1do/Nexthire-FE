import { useParams } from 'react-router-dom'
import { useSavedJobsHydrate } from '../../hooks/useSavedJobsHydrate'
import { useTranslations } from '../../i18n'
import { EmptyState, Loading } from '../_components'
import { JobDetailHero } from './components/JobDetailHero'
import { JobDetailSection } from './components/JobDetailSection'
import { JobDetailSidebar } from './components/JobDetailSidebar'
import { RelatedJobs } from './components/RelatedJobs'
import { useJobDetail } from './hooks/useJobDetail'

export function JobDetailPage() {
  const { pages } = useTranslations()
  const content = pages.jobDetail
  const { id = '' } = useParams()
  useSavedJobsHydrate(id ? [id] : [])
  const { job, sections, related, loading, error, notFound } = useJobDetail(id)

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-state">
          <Loading label={content.states.loading} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="job-detail-page">
        <section className="job-detail-not-found job-detail-motion">
          <span>404</span>
          <h1>{content.notFound.title}</h1>
          <p>{content.notFound.description}</p>
          <a href="/search">{content.notFound.action}</a>
        </section>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-state">
          <EmptyState
            description={content.states.errorDescription}
            title={content.states.errorTitle}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="job-detail-page">
      <a className="job-detail-back-link" href="/search">
        {content.backToSearch}
      </a>

      <JobDetailHero content={content.hero} job={job} />

      <div className="job-detail-layout">
        <div className="job-detail-content">
          {sections.map((section) => (
            <JobDetailSection key={section.title} section={section} />
          ))}
        </div>

        <JobDetailSidebar content={content.sidebar} job={job} />
      </div>

      <RelatedJobs content={content.related} jobs={related} />
    </div>
  )
}

export default JobDetailPage
