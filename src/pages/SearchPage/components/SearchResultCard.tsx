import type { SearchTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { JobCardView } from '../../HomePage/types'

type SearchResultCardProps = {
  job: JobCardView
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
  const companyHref = createCompanyDetailHrefById(job.companyId)

  return (
    <article className="search-result-card home-hover-card">
      <a aria-label={job.company} className="search-company-logo-link" href={companyHref}>
        <CompanyLogoMark
          alt={job.logo.alt}
          className="search-result-logo"
          fallbackText={job.logo.fallbackText}
          src={job.logo.src}
          tone={job.logo.tone}
        />
      </a>

      <div className="search-result-main">
        <div className="search-result-company">
          <a href={companyHref}>{job.company}</a>
          {job.verified ? <small>{labels.verifiedLabel}</small> : null}
        </div>

        <h3>{job.title}</h3>

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

      <a className="search-detail-link" href={createJobDetailHrefById(job.id)}>
        {labels.detailLabel}
      </a>
    </article>
  )
}
