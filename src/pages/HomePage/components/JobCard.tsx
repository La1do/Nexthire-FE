import type { HomeJobItem } from '../../../i18n/types'

type JobCardProps = {
  job: HomeJobItem
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="job-card home-hover-card">
      <div className="job-card-topline">
        <span className="job-logo">{job.initials}</span>
        <span className={`job-salary job-salary-${job.badgeTone}`}>{job.salary}</span>
      </div>
      <p className="job-field">{job.field}</p>
      <h3>{job.title}</h3>
      <p className="job-company">{job.company}</p>
      <p className="job-location">
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2" />
        </svg>
        {job.location}
      </p>
      <p className="job-description">{job.description}</p>
    </article>
  )
}
