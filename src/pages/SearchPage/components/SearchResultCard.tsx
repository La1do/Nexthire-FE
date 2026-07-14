import type { HomeJobItem, SearchTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createJobDetailHref } from '../../_utils/jobRoutes'

type SearchResultCardProps = {
  job: HomeJobItem
  labels: SearchTranslations['results']
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
    </svg>
  )
}

export function SearchResultCard({ job, labels }: SearchResultCardProps) {
  return (
    <article className="search-result-card home-hover-card">
      <CompanyLogoMark
        alt={job.companyLogo.alt}
        className="search-result-logo"
        fallbackText={job.companyLogo.fallbackText}
        src={job.companyLogo.src}
        tone={job.companyLogo.tone}
      />

      <div className="search-result-main">
        <div className="search-result-company">
          <span>{job.company}</span>
          {job.verified ? <small>{labels.verifiedLabel}</small> : null}
        </div>

        <h3>{job.title}</h3>
        <p>{job.description}</p>

        <div className="search-result-meta">
          <span>{job.location}</span>
          <span>{job.workMode}</span>
          <span>{job.salary}</span>
          <span>{job.postedAt}</span>
        </div>

        <div className="search-result-tags">
          {job.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <button aria-label={labels.saveLabel} className="search-save-button" type="button">
        <BookmarkIcon />
      </button>

      <a className="search-detail-link" href={createJobDetailHref(job)}>
        {labels.detailLabel}
      </a>
    </article>
  )
}
