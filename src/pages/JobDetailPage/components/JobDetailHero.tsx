import type { HomeJobItem, JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHref } from '../../_utils/jobRoutes'

type JobDetailHeroProps = {
  content: JobDetailTranslations['hero']
  job: HomeJobItem
}

export function JobDetailHero({ content, job }: JobDetailHeroProps) {
  const companyHref = createCompanyDetailHref(job.company)

  return (
    <section className="job-detail-hero job-detail-motion">
      <a className={`job-detail-logo-panel job-detail-logo-panel-${job.companyLogo.tone}`} href={companyHref}>
        <CompanyLogoMark
          alt={job.companyLogo.alt}
          className="job-detail-hero-logo"
          fallbackText={job.companyLogo.fallbackText}
          src={job.companyLogo.src}
          tone={job.companyLogo.tone}
        />
      </a>

      <div className="job-detail-hero-copy">
        <div className="job-detail-company-line">
          <a className="job-detail-company-link" href={companyHref}>{job.company}</a>
          {job.verified ? <small>{content.verifiedLabel}</small> : null}
        </div>

        <h1>{job.title}</h1>
        <p>{job.description}</p>

        <div aria-label={content.metaLabel} className="job-detail-hero-meta">
          <span>{job.location}</span>
          <span>{job.workMode}</span>
          <span>{job.salary}</span>
          <span>{job.postedAt}</span>
        </div>

        <div className="job-detail-tags">
          {job.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
