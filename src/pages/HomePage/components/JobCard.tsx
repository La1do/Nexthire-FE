import type { HomeJobItem } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHref, createJobDetailHref } from '../../_utils/jobRoutes'

type JobCardProps = {
  job: HomeJobItem
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
  const classes = ['job-card', 'home-hover-card', variant === 'compact' ? 'job-card-compact' : ''].filter(Boolean).join(' ')
  const companyHref = createCompanyDetailHref(job.company)

  return (
    <article className={classes}>
      <a aria-label={`${job.title} ${job.company}`} className="job-card-link-layer" href={createJobDetailHref(job)} />

      <div className={`job-card-media job-card-media-${job.companyLogo.tone}`}>
        <a aria-label={job.company} className="job-card-company-link" href={companyHref}>
          <CompanyLogoMark
            alt={job.companyLogo.alt}
            className="job-company-logo-image"
            fallbackText={job.companyLogo.fallbackText}
            src={job.companyLogo.src}
            tone={job.companyLogo.tone}
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

      <p className="job-description">{job.description}</p>

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
