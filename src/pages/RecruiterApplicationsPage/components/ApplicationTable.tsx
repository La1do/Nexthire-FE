import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import { AiMatchBadge } from './AiMatchBadge'

type ApplicationTableHandlers = {
  onEmail: (application: RecruiterApplicationItem) => void
  onOpenResume: (application: RecruiterApplicationItem) => void
  onView: (application: RecruiterApplicationItem) => void
}

type ApplicationTableProps = {
  actions: RecruiterApplicationsTranslations['results']
  applications: ReadonlyArray<RecruiterApplicationItem>
  columns: RecruiterApplicationsTranslations['results']['columns']
  handlers: ApplicationTableHandlers
  matchLabels: RecruiterApplicationsTranslations['match']
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

function ViewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 3v5h5" />
      <path d="M6 3h8l5 5v13H6z" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  )
}

export function ApplicationTable({
  actions,
  applications,
  columns,
  handlers,
  matchLabels,
  statusLabels,
}: ApplicationTableProps) {
  return (
    <div className="recruiter-applications-table-wrap">
      <table className="recruiter-applications-table">
        <caption className="sr-only">{actions.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{columns.candidate}</th>
            <th scope="col">{columns.job}</th>
            <th scope="col">{columns.status}</th>
            <th scope="col">{columns.score}</th>
            <th scope="col">{columns.submittedAt}</th>
            <th className="recruiter-applications-table__actions-col" scope="col">
              {columns.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                <div className="recruiter-applications-candidate-cell">
                  <span aria-hidden="true" className="recruiter-applications-avatar">
                    {getInitials(application.candidateName)}
                  </span>
                  <div>
                    <p className="recruiter-applications-candidate-cell__name">{application.candidateName}</p>
                    <p className="recruiter-applications-candidate-cell__email">{application.candidateEmail}</p>
                  </div>
                </div>
              </td>
              <td>
                <p className="recruiter-applications-table__job">{application.jobTitle}</p>
                <small>{application.candidateHeadline}</small>
              </td>
              <td>
                <span className={`recruiter-application-status recruiter-application-status--${application.status}`}>
                  {statusLabels[application.status]}
                </span>
              </td>
              <td>
                <AiMatchBadge application={application} labels={matchLabels} />
              </td>
              <td className="recruiter-applications-table__meta">{application.submittedAt}</td>
              <td className="recruiter-applications-table__actions">
                <button
                  aria-label={`${actions.actionView}: ${application.candidateName}`}
                  className="recruiter-applications-icon-button"
                  onClick={() => handlers.onView(application)}
                  title={actions.actionView}
                  type="button"
                >
                  <ViewIcon />
                </button>
                <button
                  aria-label={`${actions.actionEmail}: ${application.candidateName}`}
                  className="recruiter-applications-icon-button"
                  onClick={() => handlers.onEmail(application)}
                  title={actions.actionEmail}
                  type="button"
                >
                  <MailIcon />
                </button>
                <button
                  aria-label={`${actions.actionDownload}: ${application.candidateName}`}
                  className="recruiter-applications-icon-button"
                  onClick={() => handlers.onOpenResume(application)}
                  title={actions.actionDownload}
                  type="button"
                >
                  <ResumeIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
