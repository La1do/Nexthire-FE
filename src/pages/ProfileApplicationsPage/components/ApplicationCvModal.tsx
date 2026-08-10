import { useEffect, useRef } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationCvDownloadResponse } from '../../../types/application.types'
import type { CandidateApplication } from '../types'

type ApplicationCvModalProps = {
  application: CandidateApplication
  download?: ApplicationCvDownloadResponse
  downloadError?: string
  isLoadingDownload: boolean
  labels: ProfileTranslations['applications']['cvPreview']
  onClose: () => void
}

export function ApplicationCvModal({
  application,
  download,
  downloadError,
  isLoadingDownload,
  labels,
  onClose,
}: ApplicationCvModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const titleId = `application-cv-title-${application.id}`
  const canPreviewInline = download?.mimeType === 'application/pdf'

  useEffect(() => {
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="profile-application-cv-backdrop" onMouseDown={onClose}>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="profile-application-cv-modal"
        onMouseDown={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
      >
        <header className="profile-application-cv-modal-header">
          <div>
            <span>{labels.title}</span>
            <h2 id={titleId}>{application.cvFileName}</h2>
            <p>{labels.subtitle}</p>
          </div>
          <button
            aria-label={labels.close}
            className="profile-application-cv-modal-close"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">x</span>
          </button>
        </header>

        <div className="profile-application-cv-file-frame">
          {isLoadingDownload ? <p className="profile-application-cv-state">{labels.loading}</p> : null}
          {downloadError ? <p className="profile-application-cv-state is-error">{downloadError}</p> : null}
          {download && canPreviewInline ? (
            <iframe src={download.url} title={application.cvFileName} />
          ) : null}
          {download && !canPreviewInline ? (
            <a href={download.url} rel="noreferrer" target="_blank">
              {labels.openExternal}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
