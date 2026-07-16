import type { RecruiterHomeTranslations } from '../../../i18n/types'
import { Button } from '../../_components'
import type { RecruiterCompany } from '../types'

type CompanyVerificationCardProps = {
  company: RecruiterCompany
  onOpenVerification: () => void
  translations: RecruiterHomeTranslations['verification']
}

function getActionLabel(status: RecruiterCompany['status'], actions: RecruiterHomeTranslations['verification']['actions']) {
  if (status === 'NO_COMPANY' || status === 'REJECTED') return actions.openForm
  if (status === 'PENDING') return actions.viewSubmitted
  return actions.manageProfile
}

function getCompanyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function CompanyVerificationCard({
  company,
  onOpenVerification,
  translations,
}: CompanyVerificationCardProps) {
  const statusClass = company.status.toLowerCase().replace('_', '-')

  return (
    <section className={`recruiter-verification-card is-${statusClass}`}>
      <div className="recruiter-verification-card__main">
        <p className="recruiter-eyebrow">{translations.eyebrow}</p>
        <div className="recruiter-verification-card__identity">
          {company.logo ? (
            <img alt={`${company.name} logo`} src={company.logo} />
          ) : (
            <span>{getCompanyInitials(company.name)}</span>
          )}
          <div>
            <div className="recruiter-verification-card__title-row">
              <h2>{translations.statusTitles[company.status]}</h2>
              <span className={`recruiter-status-pill recruiter-status-pill--${statusClass}`}>
                {translations.statusLabels[company.status]}
              </span>
            </div>
            <p>{translations.statusDescriptions[company.status]}</p>
          </div>
        </div>

        {company.status === 'REJECTED' && company.rejectionReason ? (
          <p className="recruiter-verification-card__reason">
            <strong>{translations.rejectionReasonLabel}:</strong> {company.rejectionReason}
          </p>
        ) : null}

        <div className="recruiter-verification-card__progress">
          <div>
            <span>{translations.completionLabel}</span>
            <strong>{company.completion}%</strong>
          </div>
          <span aria-hidden="true">
            <span style={{ width: `${company.completion}%` }} />
          </span>
        </div>
      </div>

      <aside className="recruiter-verification-card__meta">
        <dl>
          <div>
            <dt>{translations.form.websiteLabel}</dt>
            <dd>{company.website}</dd>
          </div>
          <div>
            <dt>{translations.submittedLabel}</dt>
            <dd>{company.submittedAt}</dd>
          </div>
          <div>
            <dt>{translations.form.taxCodeLabel}</dt>
            <dd>{company.taxCode}</dd>
          </div>
        </dl>
        <Button className="w-full" onClick={onOpenVerification}>
          {getActionLabel(company.status, translations.actions)}
        </Button>
      </aside>
    </section>
  )
}
