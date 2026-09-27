import { Link } from 'react-router-dom'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { ApplicationJobStage, ApplicationJobSummary } from '../types'
import { getJobApplicationsHref } from '../utils/applicationRoutes'
import { ApplicationJobStatusBadge } from './ApplicationJobStatusBadge'

type ApplicationJobCardProps = {
  content: RecruiterApplicationsTranslations['jobList']
  job: ApplicationJobSummary
  statusLabels: RecruiterApplicationsTranslations['jobStatusLabels']
}

const stageOrder: ReadonlyArray<ApplicationJobStage> = ['new', 'inProgress', 'decided']

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function ApplicationJobCard({ content, job, statusLabels }: ApplicationJobCardProps) {
  return (
    <li className="recruiter-application-job-card">
      <div className="recruiter-application-job-card__main">
        <div className="recruiter-application-job-card__heading">
          <h3 className="recruiter-application-job-card__title">
            <Link
              aria-label={content.openActionLabel.replace('{{job}}', job.title)}
              className="recruiter-application-job-card__title-link"
              to={getJobApplicationsHref(job.id)}
            >
              {job.title}
            </Link>
          </h3>
          <ApplicationJobStatusBadge labels={statusLabels} status={job.status} />
        </div>
        <p className="recruiter-application-job-card__assignee">
          <span>{content.assigneeLabel}</span>
          <strong className={job.assigneeName ? undefined : 'is-empty'}>{job.assigneeName ?? content.unassigned}</strong>
        </p>
      </div>

      <dl className="recruiter-application-job-card__counts" aria-label={content.counts.label}>
        {stageOrder.map((stage) => (
          <div className={`recruiter-application-job-count recruiter-application-job-count--${stage}`} key={stage}>
            <dt>{content.counts[stage]}</dt>
            <dd>{job.counts[stage]}</dd>
          </div>
        ))}
      </dl>

      <div className="recruiter-application-job-card__footer">
        <span className="recruiter-application-job-card__total">
          {content.totalLabel.replace('{{count}}', String(job.totalApplications))}
        </span>
        <span aria-hidden="true" className="recruiter-application-job-card__open">
          {content.openAction}
          <ArrowIcon />
        </span>
      </div>
    </li>
  )
}
