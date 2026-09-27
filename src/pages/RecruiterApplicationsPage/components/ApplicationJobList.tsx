import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { ApplicationJobSummary } from '../types'
import { ApplicationJobCard } from './ApplicationJobCard'
import './application-job-list.css'

type ApplicationJobListProps = {
  content: RecruiterApplicationsTranslations['jobList']
  jobs: ReadonlyArray<ApplicationJobSummary>
  statusLabels: RecruiterApplicationsTranslations['jobStatusLabels']
}

export function ApplicationJobList({ content, jobs, statusLabels }: ApplicationJobListProps) {
  return (
    <ul aria-label={content.caption} className="recruiter-application-job-list">
      {jobs.map((job) => (
        <ApplicationJobCard content={content} job={job} key={job.id} statusLabels={statusLabels} />
      ))}
    </ul>
  )
}
