import { CompanyLogoMark, SaveJobBookmarkButton } from '../../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { JobCardView } from '../types'

type JobCardProps = {
  job: JobCardView
  labels: {
    loginAriaLabel: string
    saveAriaLabel: string
    savedAriaLabel: string
  }
  variant?: 'default' | 'compact'
}

function CheckIcon() {
  return (
    <svg aria-label="Verified company" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="m9 12 2 2 4-5" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function JobCard({ job, labels, variant = 'default' }: JobCardProps) {
  const classes = ['job-card', variant === 'compact' ? 'job-card-compact' : ''].filter(Boolean).join(' ')
  const companyHref = createCompanyDetailHrefById(job.companyId)

  return (
    <article className={classes}>
      <a aria-label={`${job.title} ${job.company}`} className="job-card-link-layer" href={createJobDetailHrefById(job.id)} />

      <div className={`job-card-media job-card-media-${job.logo.tone}`}>
        <a aria-label={job.company} className="job-card-company-link" href={companyHref}>
          <CompanyLogoMark
            alt={job.logo.alt}
            className="job-company-logo-image"
            fallbackText={job.logo.fallbackText}
            src={job.logo.src}
            tone={job.logo.tone}
          />
        </a>
        <SaveJobBookmarkButton
          className="job-save-overlay"
          jobId={job.id}
          labels={labels}
        />
      </div>

      <div className="job-company-row">
        <a className="job-company job-company-link" href={companyHref}>{job.company}</a>
        {job.verified ? <CheckIcon /> : null}
      </div>

      <h3>{job.title}</h3>

      <div className="job-meta-row">
        <span>{job.location}</span>
        <span>{job.workMode}</span>
        <span className={`job-salary job-salary-${job.badgeTone}`}>{job.salary}</span>
      </div>

      <div className="job-card-footer">
        <div className="job-tag-row">
          {job.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <span className="job-posted-at">{job.postedAt}</span>
      </div>
    </article>
  )
}
