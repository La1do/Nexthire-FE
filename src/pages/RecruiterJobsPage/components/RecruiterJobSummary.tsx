import type { RecruiterJobsTranslations } from '../../../i18n/types'
import type { RecruiterJobStatusCounts } from '../../../types/job.types'
import { formatCompactNumber } from '../utils/recruiterJobsData'

type RecruiterJobSummaryProps = {
  counts: RecruiterJobStatusCounts
  locale: string
  translations: RecruiterJobsTranslations
}

export function RecruiterJobSummary({
  counts,
  locale,
  translations,
}: RecruiterJobSummaryProps) {
  const totalJobs = Object.values(counts).reduce((total, count) => total + count, 0)
  const needsActionCount = counts.DRAFT + counts.NEEDS_REVIEW + counts.SHOULD_REJECT + counts.REJECTED
  const publishedCount = counts.PUBLISHED
  const closingCount = counts.UNPUBLISHED + counts.CLOSED + counts.EXPIRED
  const items = [
    {
      description: translations.summary.totalDescription,
      hasIndicator: false,
      label: translations.summary.total,
      tone: 'total',
      value: totalJobs,
    },
    {
      description: translations.summary.needsActionDescription,
      hasIndicator: true,
      label: translations.summary.needsAction,
      tone: 'action',
      value: needsActionCount,
    },
    {
      description: translations.summary.publishedDescription,
      hasIndicator: false,
      label: translations.summary.published,
      tone: 'published',
      value: publishedCount,
    },
    {
      description: translations.summary.inactiveDescription,
      hasIndicator: false,
      label: translations.summary.inactive,
      tone: 'inactive',
      value: closingCount,
    },
  ]

  return (
    <section className="recruiter-job-summary" aria-label={translations.summary.label}>
      {items.map((item) => {
        const isAction = item.tone === 'action'
        const showIndicator = isAction && item.hasIndicator && item.value > 0
        const cardClassName = `recruiter-job-summary-card recruiter-job-summary-card--${item.tone}${isAction && item.value > 0 ? ' is-action' : ''}`

        return (
          <article
            aria-label={`${item.label}: ${item.value}`}
            className={cardClassName}
            data-tone={item.tone}
            key={item.label}
          >
            <span aria-hidden="true" />
            <div>
              <p>{item.label}</p>
              <strong>{formatCompactNumber(item.value, locale)}</strong>
              <small>{item.description}</small>
            </div>
            {showIndicator ? (
              <span
                aria-hidden="true"
                className="recruiter-job-summary-card__indicator"
              />
            ) : null}
          </article>
        )
      })}
    </section>
  )
}