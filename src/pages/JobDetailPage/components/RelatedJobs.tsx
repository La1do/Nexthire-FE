import type { HomeJobItem, JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createJobDetailHref } from '../../_utils/jobRoutes'

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
        {jobs.map((job) => (
          <article className="job-detail-related-card home-hover-card" key={`${job.company}-${job.title}`}>
            <CompanyLogoMark
              alt={job.companyLogo.alt}
              className="job-detail-related-logo"
              fallbackText={job.companyLogo.fallbackText}
              src={job.companyLogo.src}
              tone={job.companyLogo.tone}
            />
            <div>
              <span>{job.company}</span>
              <h3>{job.title}</h3>
              <p>{job.location}</p>
            </div>
            <a href={createJobDetailHref(job)}>{content.viewDetail}</a>
          </article>
        ))}
      </div>
    </section>
  )
}
