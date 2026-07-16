import type { HomeJobItem, JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHref, createJobDetailHref } from '../../_utils/jobRoutes'

type RelatedJobsProps = {
  content: JobDetailTranslations['related']
  jobs: ReadonlyArray<HomeJobItem>
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
          const companyHref = createCompanyDetailHref(job.company)

          return (
            <article className="job-detail-related-card home-hover-card" key={`${job.company}-${job.title}`}>
              <a aria-label={job.company} className="job-detail-related-logo-link" href={companyHref}>
                <CompanyLogoMark
                  alt={job.companyLogo.alt}
                  className="job-detail-related-logo"
                  fallbackText={job.companyLogo.fallbackText}
                  src={job.companyLogo.src}
                  tone={job.companyLogo.tone}
                />
              </a>
              <div>
                <a className="job-detail-related-company" href={companyHref}>{job.company}</a>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
              </div>
              <a href={createJobDetailHref(job)}>{content.viewDetail}</a>
            </article>
          )
        })}
      </div>
    </section>
  )
}
