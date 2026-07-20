import { useState } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateApplication } from '../types'
import { ApplicationCvModal } from './ApplicationCvModal'

type ApplicationCardProps = {
  actions: ProfileTranslations['applications']['actions']
  application: CandidateApplication
  cvPreview: ProfileTranslations['applications']['cvPreview']
  formatDate: (value: string) => string
  meta: ProfileTranslations['applications']['meta']
  profile: ProfileTranslations['profile']
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

export function ApplicationCard({
  actions,
  application,
  cvPreview,
  formatDate,
  meta,
  profile,
  statusLabels,
}: ApplicationCardProps) {
  const [isCvOpen, setCvOpen] = useState(false)
  const statusClassName = `profile-application-status profile-application-status--${application.status.toLowerCase()}`

  return (
    <>
      <article className="profile-application-card profile-card-motion">
        <div className="profile-application-card-main">
          <span className={statusClassName}>{statusLabels[application.status]}</span>
          <div>
            <h2>{application.jobTitle}</h2>
            <p>{application.companyName}</p>
          </div>

          <p className="profile-application-cv-inline">
            <span>{meta.cvFile}</span>
            <button
              aria-label={`${cvPreview.open} ${application.cvFileName}`}
              className="profile-application-cv-link"
              onClick={() => setCvOpen(true)}
              type="button"
            >
              {application.cvFileName}
            </button>
          </p>

          <dl className="profile-application-details">
            <div>
              <dt>{meta.location}</dt>
              <dd>{application.location}</dd>
            </div>
            <div>
              <dt>{meta.workingType}</dt>
              <dd>{application.workingType}</dd>
            </div>
            <div>
              <dt>{meta.salary}</dt>
              <dd>{application.salaryLabel}</dd>
            </div>
          </dl>

          <details className="profile-application-cover-letter">
            <summary>{meta.coverLetter}</summary>
            <p>{application.coverLetter}</p>
          </details>
        </div>

        <div className="profile-application-card-side">
          <dl>
            <div>
              <dt>{meta.appliedAt}</dt>
              <dd>
                <time dateTime={application.appliedAt}>{formatDate(application.appliedAt)}</time>
              </dd>
            </div>
            <div>
              <dt>{meta.updatedAt}</dt>
              <dd>
                <time dateTime={application.updatedAt}>{formatDate(application.updatedAt)}</time>
              </dd>
            </div>
          </dl>
          <a href={`/jobs/${application.jobId}`}>{actions.viewJob}</a>
        </div>
      </article>

      {isCvOpen ? (
        <ApplicationCvModal application={application} labels={cvPreview} onClose={() => setCvOpen(false)} profile={profile} />
      ) : null}
    </>
  )
}
