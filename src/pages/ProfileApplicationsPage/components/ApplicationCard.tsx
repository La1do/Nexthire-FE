import { useState } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationCvDownloadResponse } from '../../../types/application.types'
import type { CandidateApplication } from '../types'
import { ApplicationCvModal } from './ApplicationCvModal'
import { ApplicationProgressTimeline } from './ApplicationProgressTimeline'

type ApplicationCardProps = {
  actions: ProfileTranslations['applications']['actions']
  application: CandidateApplication
  cvPreview: ProfileTranslations['applications']['cvPreview']
  formatDate: (value: string) => string
  meta: ProfileTranslations['applications']['meta']
  onLoadCv: (applicationId: string) => Promise<ApplicationCvDownloadResponse>
  progressLabels: ProfileTranslations['applications']['progress']
  statusLabels: ProfileTranslations['applications']['statusLabels']
}

export function ApplicationCard({
  actions,
  application,
  cvPreview,
  formatDate,
  meta,
  onLoadCv,
  progressLabels,
  statusLabels,
}: ApplicationCardProps) {
  const [isCvOpen, setCvOpen] = useState(false)
  const [cvDownload, setCvDownload] = useState<ApplicationCvDownloadResponse | undefined>(undefined)
  const [cvDownloadError, setCvDownloadError] = useState<string | undefined>(undefined)
  const [isCvLoading, setCvLoading] = useState(false)
  const statusClassName = `profile-application-status profile-application-status--${application.status.toLowerCase()}`

  async function openCvPreview() {
    setCvOpen(true)

    if (cvDownload || isCvLoading) {
      return
    }

    setCvLoading(true)
    setCvDownloadError(undefined)

    try {
      setCvDownload(await onLoadCv(application.id))
    } catch {
      setCvDownloadError(cvPreview.error)
    } finally {
      setCvLoading(false)
    }
  }

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
              onClick={() => void openCvPreview()}
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

          <ApplicationProgressTimeline
            application={application}
            formatDate={formatDate}
            labels={progressLabels}
          />
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
        <ApplicationCvModal
          application={application}
          download={cvDownload}
          downloadError={cvDownloadError}
          isLoadingDownload={isCvLoading}
          labels={cvPreview}
          onClose={() => setCvOpen(false)}
        />
      ) : null}
    </>
  )
}
