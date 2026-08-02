import type { RecruiterVerificationTranslations } from '../../../i18n/types'
import type { CompanyResponse } from '../../../types/company.types'
import type { CompanyVerificationStatus } from '../types'

type VerificationStatusPanelProps = {
  company: CompanyResponse | null
  locale: string
  translations: RecruiterVerificationTranslations['status']
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function VerificationStatusPanel({
  company,
  locale,
  translations,
}: VerificationStatusPanelProps) {
  const status: CompanyVerificationStatus = company?.status ?? 'NO_COMPANY'
  const statusClass = status.toLowerCase().replace('_', '-')
  const missingFields = company?.missingRequiredFields ?? ['name', 'taxCode', 'website', 'address', 'description']

  return (
    <section className={`verification-status verification-status--${statusClass}`} id="verification-status">
      <div className="verification-status__copy">
        <span className="verification-status__label">{translations.labels[status]}</span>
        <h2>{translations.titles[status]}</h2>
        <p>{translations.descriptions[status]}</p>
      </div>

      <dl className="verification-status__facts">
        <div>
          <dt>{translations.completion}</dt>
          <dd>{company?.completionPercent ?? 0}%</dd>
        </div>
        <div>
          <dt>{translations.submittedAt}</dt>
          <dd>{formatDate(company?.submittedAt, locale, translations.notSubmitted)}</dd>
        </div>
        <div>
          <dt>{translations.postingAccess}</dt>
          <dd>{company?.canPostJobs ? translations.postingUnlocked : translations.postingLocked}</dd>
        </div>
      </dl>

      {status === 'REJECTED' && company?.rejectionReason ? (
        <div className="verification-status__reason" role="alert">
          <strong>{translations.rejectionReason}</strong>
          <p>{company.rejectionReason}</p>
        </div>
      ) : null}

      {missingFields.length > 0 && status !== 'SUSPENDED' ? (
        <div className="verification-status__missing">
          <strong>{translations.missingTitle}</strong>
          <ul>
            {missingFields.map((field) => {
              const label = translations.missingFieldLabels[field as keyof typeof translations.missingFieldLabels]
              return label ? <li key={field}>{label}</li> : null
            })}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
