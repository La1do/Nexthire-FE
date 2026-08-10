import type { JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { RelatedJobView } from '../types'

type RelatedJobsProps = {
  content: JobDetailTranslations['related']
  jobs: ReadonlyArray<RelatedJobView>
}

export function RelatedJobs({ content, jobs }: RelatedJobsProps) {
  if (!jobs.length) {
    return null
  }

  return (
    <section className="job-detail-related job-detail-motion">
      <div className="job-detail-related-heading">
        <h2>{content.title}</h2>
        <a href="/search">{content.viewAll}</a>
      </div>

      <div className="job-detail-related-grid">
        {jobs.map((job) => {
          const companyHref = createCompanyDetailHrefById(job.companyId)

          return (
            <article className="job-detail-related-card home-hover-card" key={job.id}>
              <a aria-label={job.company} className="job-detail-related-logo-link" href={companyHref}>
                <CompanyLogoMark
                  alt={job.logo.alt}
                  className="job-detail-related-logo"
                  fallbackText={job.logo.fallbackText}
                  src={job.logo.src}
                  tone={job.logo.tone}
                />
              </a>
              <div>
                <a className="job-detail-related-company" href={companyHref}>{job.company}</a>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
              </div>
              <a href={createJobDetailHrefById(job.id)}>{content.viewDetail}</a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
