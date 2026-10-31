import { Link } from 'react-router-dom'
import type { JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { RelatedJobView } from '../types'

type RelatedJobsProps = {
  content: JobDetailTranslations['related']
  jobs: ReadonlyArray<RelatedJobView>
}

export function RelatedJobs({ jobs }: RelatedJobsProps) {
  if (!jobs || jobs.length === 0) {
    return null
  }

  return (
    <section className="job-detail-card job-detail-related-card-section">
      <header className="job-detail-card__header">
        <h2 className="job-detail-card__title">Việc làm liên quan</h2>
      </header>

      <div className="job-detail-related-grid">
        {jobs.map((item) => {
          const companyHref = createCompanyDetailHrefById(item.companyId)
          const jobHref = createJobDetailHrefById(item.id)

          return (
            <article className="job-detail-related-job-item" key={item.id}>
              <Link to={companyHref} className="job-detail-related-job-item__logo-link">
                <CompanyLogoMark
                  alt={item.logo.alt}
                  className="job-detail-related-job-item__logo"
                  fallbackText={item.logo.fallbackText}
                  src={item.logo.src}
                  tone={item.logo.tone}
                />
              </Link>

              <div className="job-detail-related-job-item__info">
                <h3 className="job-detail-related-job-item__title">
                  <Link to={jobHref}>{item.title}</Link>
                </h3>
                <Link to={companyHref} className="job-detail-related-job-item__company">
                  {item.company}
                </Link>
                <div className="job-detail-related-job-item__meta">
                  {item.salary && (
                    <span className="job-detail-related-job-item__salary">{item.salary}</span>
                  )}
                  <span className="job-detail-related-job-item__location">{item.location}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
