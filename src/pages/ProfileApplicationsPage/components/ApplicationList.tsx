import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationCvDownloadResponse } from '../../../types/application.types'
import type { CandidateApplication } from '../types'
import { ApplicationCard } from './ApplicationCard'

type ApplicationListProps = {
  actions: ProfileTranslations['applications']['actions']
  applications: ReadonlyArray<CandidateApplication>
  cvPreview: ProfileTranslations['applications']['cvPreview']
  formatDate: (value: string) => string
  meta: ProfileTranslations['applications']['meta']
  onLoadCv: (applicationId: string) => Promise<ApplicationCvDownloadResponse>
  progressLabels: ProfileTranslations['applications']['progress']
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

export function ApplicationList({
  actions,
  applications,
  cvPreview,
  formatDate,
  meta,
  onLoadCv,
  progressLabels,
  statusLabels,
}: ApplicationListProps) {
  return (
    <div className="profile-application-list">
      {applications.map((application) => (
        <ApplicationCard
          actions={actions}
          application={application}
          cvPreview={cvPreview}
          formatDate={formatDate}
          key={application.id}
          meta={meta}
          onLoadCv={onLoadCv}
          progressLabels={progressLabels}
          statusLabels={statusLabels}
        />
      ))}
    </div>
  )
}
