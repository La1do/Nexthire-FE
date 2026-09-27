import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { ApplicationJobAccess } from '../types'
import { ApplicationJobBackLink } from './ApplicationJobBackLink'
import { ApplicationJobStatusBadge } from './ApplicationJobStatusBadge'
import './application-job-header.css'

type ApplicationJobHeaderProps = {
  content: RecruiterApplicationsTranslations['jobDetail']
  job: ApplicationJobAccess
  statusLabels: RecruiterApplicationsTranslations['jobStatusLabels']
}

export function ApplicationJobHeader({ content, job, statusLabels }: ApplicationJobHeaderProps) {
  return (
    <section className="recruiter-applications-hero recruiter-application-job-header">
      <ApplicationJobBackLink label={content.backToList} />
      <div className="recruiter-application-job-header__body">
        <p className="recruiter-eyebrow">{content.eyebrow}</p>
        <h2>{job.title}</h2>
        <div className="recruiter-application-job-header__meta">
          <ApplicationJobStatusBadge labels={statusLabels} status={job.status} />
          {job.assigneeName ? (
            <span className="recruiter-application-job-header__assignee">
              {content.assigneeLabel.replace('{{name}}', job.assigneeName)}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  )
}
