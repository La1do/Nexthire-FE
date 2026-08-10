import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import { AiMatchBadge } from './AiMatchBadge'

type ApplicationMobileListHandlers = {
  onEmail: (application: RecruiterApplicationItem) => void
  onOpenResume: (application: RecruiterApplicationItem) => void
  onView: (application: RecruiterApplicationItem) => void
}

type ApplicationMobileListProps = {
  actions: RecruiterApplicationsTranslations['results']
  applications: ReadonlyArray<RecruiterApplicationItem>
  columns: RecruiterApplicationsTranslations['results']['columns']
  handlers: ApplicationMobileListHandlers
  matchLabels: RecruiterApplicationsTranslations['match']
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function ApplicationMobileList({
  actions,
  applications,
  columns,
  handlers,
  matchLabels,
  statusLabels,
}: ApplicationMobileListProps) {
  return (
    <ul className="recruiter-applications-mobile-list">
      {applications.map((application) => (
        <li className="recruiter-applications-mobile-card" key={application.id}>
          <div className="recruiter-applications-candidate-cell">
            <span aria-hidden="true" className="recruiter-applications-avatar">
              {getInitials(application.candidateName)}
            </span>
            <div>
              <p className="recruiter-applications-candidate-cell__name">{application.candidateName}</p>
              <p className="recruiter-applications-candidate-cell__email">{application.candidateEmail}</p>
            </div>
          </div>

          <div className="recruiter-applications-mobile-card__badges">
            <span className={`recruiter-application-status recruiter-application-status--${application.status}`}>
              {statusLabels[application.status]}
            </span>
            <AiMatchBadge application={application} labels={matchLabels} />
          </div>

          <dl className="recruiter-applications-mobile-card__meta">
            <div>
              <dt>{columns.job}</dt>
              <dd>{application.jobTitle}</dd>
            </div>
            <div>
              <dt>{columns.submittedAt}</dt>
              <dd>{application.submittedAt}</dd>
            </div>
          </dl>

          <div className="recruiter-applications-mobile-card__actions" role="group">
            <button onClick={() => handlers.onView(application)} type="button">
              {actions.actionView}
            </button>
            <button onClick={() => handlers.onEmail(application)} type="button">
              {actions.actionEmail}
            </button>
            <button onClick={() => handlers.onOpenResume(application)} type="button">
              {actions.actionDownload}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
