import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateApplication } from '../types'

type ApplicationCardProps = {
  actions: ProfileTranslations['applications']['actions']
  application: CandidateApplication
  formatDate: (value: string) => string
  meta: ProfileTranslations['applications']['meta']
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

export function ApplicationCard({
  actions,
  application,
  formatDate,
  meta,
  statusLabels,
}: ApplicationCardProps) {
  const statusClassName = `profile-application-status profile-application-status--${application.status.toLowerCase()}`

  return (
    <article className="profile-application-card profile-card-motion">
      <div className="profile-application-card-main">
        <span className={statusClassName}>{statusLabels[application.status]}</span>
        <div>
          <h2>{application.jobTitle}</h2>
          <p>{application.companyName}</p>
        </div>

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
  )
}
