import type { HomeJobItem, SearchTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'

type SearchResultCardProps = {
  job: HomeJobItem
  labels: SearchTranslations['results']
}

export function SearchResultCard({ job, labels }: SearchResultCardProps) {
  return (
    <article className="search-result-card home-hover-card">
      <div className="search-result-logo-row">
        <CompanyLogoMark
          alt={job.companyLogo.alt}
          className="search-result-logo"
          fallbackText={job.companyLogo.fallbackText}
          src={job.companyLogo.src}
          tone={job.companyLogo.tone}
        />
        <button aria-label={labels.saveLabel} className="search-save-button" type="button">
          {labels.saveLabel}
        </button>
      </div>

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

      <a className="search-detail-link" href="/">
        {labels.detailLabel}
      </a>
    </article>
  )
}
