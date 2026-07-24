import { CompanyLogoMark } from '../../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import { useToggleSavedJob } from '../../../hooks/useToggleSavedJob'
import type { ProfileSavedJobTranslations } from '../types'
import type { SavedJobItem } from '../../../types/savedJob.types'
import { savedJobStatusLabelKey } from '../utils/mapSavedJob'

type SavedJobCardProps = {
  item: SavedJobItem
  labels: ProfileSavedJobTranslations['card']
  notAvailableLabel: string
  salaryLabel: string
  locationLabel: string
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="saved-jobs-card-remove-spin"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </svg>
  )
}

export function SavedJobCard({ item, labels, notAvailableLabel, salaryLabel, locationLabel }: SavedJobCardProps) {
  const company = item.companyName ?? notAvailableLabel
  const companyHref = createCompanyDetailHrefById(item.companyId)
  const { isSaved, pending, toggle } = useToggleSavedJob(item.jobId)

  if (!isSaved) {
    return null
  }

  return (
    <article className="saved-jobs-card">
      <a aria-label={company} className="saved-jobs-card-logo" href={companyHref}>
        <CompanyLogoMark
          alt={`${company} logo`}
          className="saved-jobs-card-logo-img"
          fallbackText={company.slice(0, 2).toUpperCase() || 'NH'}
          src={item.companyLogoUrl ?? ''}
          tone="blue"
        />
      </a>

      <div className="saved-jobs-card-main">
        <div className="saved-jobs-card-head">
          <a className="saved-jobs-card-title" href={createJobDetailHrefById(item.jobId)}>
            {item.title}
          </a>
          <span className="saved-jobs-card-status">
            {labels.statusLabel}: {labels.statusValues[savedJobStatusLabelKey(item.status)]}
          </span>
        </div>

        <div className="saved-jobs-card-company">
          <a href={companyHref}>{company}</a>
        </div>

        <div className="saved-jobs-card-meta">
          <span>{locationLabel}: {item.location}</span>
          <span>
            {salaryLabel}:{' '}
            {item.isSalaryVisible ? `${item.salaryMin ?? ''}–${item.salaryMax ?? ''} ${item.salaryCurrency}` : '—'}
          </span>
          <span>
            {labels.savedAtLabel}: {new Date(item.savedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="saved-jobs-card-actions">
        <a className="saved-jobs-card-view" href={createJobDetailHrefById(item.jobId)}>
          {labels.viewJobLabel}
        </a>
        <button
          aria-label={pending ? labels.removingAriaLabel : labels.removeAriaLabel}
          className="saved-jobs-card-remove"
          disabled={pending}
          onClick={() => void toggle()}
          type="button"
        >
          {pending ? <LoadingIcon /> : <TrashIcon />}
        </button>
      </div>
    </article>
  )
}
