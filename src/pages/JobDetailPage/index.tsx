import { useTranslations } from '../../i18n'
import { createJobSlug, findJobBySlug, getHomeJobList } from '../_utils/jobRoutes'
import { JobDetailHero } from './components/JobDetailHero'
import { JobDetailSection } from './components/JobDetailSection'
import { JobDetailSidebar } from './components/JobDetailSidebar'
import { RelatedJobs } from './components/RelatedJobs'
import { getJobDetailSections } from './utils/jobDetailData'

function getCurrentJobSlug() {
  if (typeof window === 'undefined') {
    return ''
  }

  const [, slug = ''] = window.location.pathname.match(/^\/jobs\/([^/]+)\/?$/) ?? []

  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export function JobDetailPage() {
  const { pages } = useTranslations()
  const home = pages.home
  const content = pages.jobDetail
  const jobs = getHomeJobList(home)
  const slug = getCurrentJobSlug()
  const job = findJobBySlug(jobs, slug)

  if (!job) {
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

  const sections = getJobDetailSections(job, content.sections)
  const relatedJobs = jobs
    .filter((relatedJob) => createJobSlug(relatedJob) !== slug)
    .filter((relatedJob) => relatedJob.field === job.field || relatedJob.location === job.location)
    .slice(0, 3)

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

      <RelatedJobs content={content.related} jobs={relatedJobs} />
    </div>
  )
}

export default JobDetailPage
