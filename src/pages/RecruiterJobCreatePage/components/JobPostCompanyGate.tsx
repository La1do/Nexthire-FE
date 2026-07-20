import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type { CompanyStatus } from '../../../types/company.types'

type GateStatus = CompanyStatus | 'NO_COMPANY'

type JobPostCompanyGateProps = {
  children: ReactNode
  isLoading: boolean
  status: GateStatus
  translations: RecruiterJobCreateTranslations['gate']
}

function getGateCopy(status: GateStatus, translations: RecruiterJobCreateTranslations['gate']) {
  if (status === 'NO_COMPANY') {
    return {
      description: translations.noCompanyDescription,
      title: translations.noCompanyTitle,
    }
  }

  if (status === 'PENDING') {
    return {
      description: translations.pendingDescription,
      title: translations.pendingTitle,
    }
  }

  if (status === 'REJECTED') {
    return {
      description: translations.rejectedDescription,
      title: translations.rejectedTitle,
    }
  }

  return {
    description: translations.suspendedDescription,
    title: translations.suspendedTitle,
  }
}

export function JobPostCompanyGate({
  children,
  isLoading,
  status,
  translations,
}: JobPostCompanyGateProps) {
  if (isLoading) {
    return (
      <section className="job-post-gate recruiter-panel">
        <span>{translations.lockedBadge}</span>
        <h2>{translations.loadingTitle}</h2>
        <p>{translations.loadingDescription}</p>
      </section>
    )
  }

  if (status !== 'APPROVED') {
    const copy = getGateCopy(status, translations)

    return (
      <section className="job-post-gate recruiter-panel">
        <span>{translations.lockedBadge}</span>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <div>
          <Link className="job-post-link-button job-post-link-button--primary" to="/recruiter">
            {translations.openDashboard}
          </Link>
          <Link className="job-post-link-button" to="/recruiter/company">
            {translations.manageCompany}
          </Link>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
