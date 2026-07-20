import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateApplication } from '../types'
import { ApplicationCard } from './ApplicationCard'

type ApplicationListProps = {
  actions: ProfileTranslations['applications']['actions']
  applications: ReadonlyArray<CandidateApplication>
  formatDate: (value: string) => string
  meta: ProfileTranslations['applications']['meta']
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

export function ApplicationList({
  actions,
  applications,
  formatDate,
  meta,
  statusLabels,
}: ApplicationListProps) {
  return (
    <div className="profile-application-list">
      {applications.map((application) => (
        <ApplicationCard
          actions={actions}
          application={application}
          formatDate={formatDate}
          key={application.id}
          meta={meta}
          statusLabels={statusLabels}
        />
      ))}
    </div>
  )
}
