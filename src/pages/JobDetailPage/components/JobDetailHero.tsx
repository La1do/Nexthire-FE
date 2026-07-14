import type { HomeJobItem, JobDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'

type JobDetailHeroProps = {
  content: JobDetailTranslations['hero']
  job: HomeJobItem
}

export function JobDetailHero({ content, job }: JobDetailHeroProps) {
  return (
    <section className="job-detail-hero job-detail-motion">
      <div className={`job-detail-logo-panel job-detail-logo-panel-${job.companyLogo.tone}`}>
        <CompanyLogoMark
          alt={job.companyLogo.alt}
          className="job-detail-hero-logo"
          fallbackText={job.companyLogo.fallbackText}
          src={job.companyLogo.src}
          tone={job.companyLogo.tone}
        />
      </div>

      <div className="job-detail-hero-copy">
        <div className="job-detail-company-line">
          <span>{job.company}</span>
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
