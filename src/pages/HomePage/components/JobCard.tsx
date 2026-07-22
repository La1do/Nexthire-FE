import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { JobCardView } from '../types'

type JobCardProps = {
  job: JobCardView
  saveLabel: string
  variant?: 'default' | 'compact'
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-label="Verified company" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="m9 12 2 2 4-5" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function JobCard({ job, saveLabel, variant = 'default' }: JobCardProps) {
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
        <button aria-label={saveLabel} className="job-save-overlay" type="button">
          <BookmarkIcon />
        </button>
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
