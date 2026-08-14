import { useState } from 'react'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { adminCompaniesService } from '../../../services/admin'
import type { CompanyVerificationDocument } from '../../../types/admin.types'

type Props = {
  companyId: string
  content: AdminCompaniesTranslations['detail']
  documents: CompanyVerificationDocument[]
  isError: boolean
  isLoading: boolean
}
type DocumentAction = 'download' | 'view'

const formatSize = (size: number) =>
  size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`

function canPreviewDocument({ fileName, mimeType }: CompanyVerificationDocument) {
  const normalizedMimeType = mimeType.toLowerCase()
  const normalizedFileName = fileName.toLowerCase()

  return (
    normalizedMimeType === 'application/pdf' ||
    normalizedMimeType.startsWith('image/') ||
    normalizedMimeType === 'text/plain' ||
    normalizedFileName.endsWith('.pdf') ||
    normalizedFileName.endsWith('.png') ||
    normalizedFileName.endsWith('.jpg') ||
    normalizedFileName.endsWith('.jpeg') ||
    normalizedFileName.endsWith('.webp') ||
    normalizedFileName.endsWith('.txt')
  )
}

export function CompanyDocumentsCard({ companyId, content, documents, isError, isLoading }: Props) {
  const [openingAction, setOpeningAction] = useState<{ id: string; action: DocumentAction } | null>(null)
  const [downloadError, setDownloadError] = useState(false)

  const openDocument = async (verificationDocument: CompanyVerificationDocument, action: DocumentAction) => {
    setOpeningAction({ action, id: verificationDocument.id })
    setDownloadError(false)
    const previewWindow = action === 'view' ? window.open('', '_blank', 'noopener,noreferrer') : null

    try {
      const download = await adminCompaniesService.getVerificationDocumentDownload(
        companyId,
        verificationDocument.documentId,
      )

      if (action === 'view') {
        const response = await fetch(download.url)
        if (!response.ok) {
          throw new Error('Unable to load document preview.')
        }

        const blob = await response.blob()
        const previewUrl = URL.createObjectURL(blob)

        if (previewWindow) {
          previewWindow.location.href = previewUrl
        } else {
          window.open(previewUrl, '_blank', 'noopener,noreferrer')
        }

        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
        return
      }

      if (action === 'download') {
        const link = document.createElement('a')
        link.href = download.url
        link.download = verificationDocument.fileName
        link.rel = 'noreferrer'
        document.body.append(link)
        link.click()
        link.remove()
        return
      }

    } catch {
      previewWindow?.close()
      setDownloadError(true)
    } finally {
      setOpeningAction(null)
    }
  }

  return (
    <section aria-labelledby="company-documents-title" className="admin-company-panel">
      <header className="admin-company-panel__header">
        <h2 id="company-documents-title">{content.documentsTitle}</h2>
        <p>{content.documentsDescription}</p>
      </header>

      {downloadError ? (
        <p className="admin-company-panel-state admin-company-panel-state--error" role="alert">
          {content.documentsError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="admin-company-panel-state">{content.documentsLoading}</p>
      ) : isError ? (
        <p className="admin-company-panel-state admin-company-panel-state--error">{content.documentsError}</p>
      ) : documents.length === 0 ? (
        <p className="admin-company-panel-state">{content.documentsEmpty}</p>
      ) : (
        <ul className="admin-company-documents">
          {documents.map((verificationDocument) => {
            const isBusy = openingAction?.id === verificationDocument.id
            const isViewing = isBusy && openingAction?.action === 'view'
            const isDownloading = isBusy && openingAction?.action === 'download'
            const canPreview = canPreviewDocument(verificationDocument)

            return (
              <li className="admin-company-document" key={verificationDocument.id}>
                <span aria-hidden="true" className="admin-company-document__icon">
                  DOC
                </span>
                <span className="admin-company-document__name">
                  <strong>{verificationDocument.fileName}</strong>
                  <small>
                    {verificationDocument.type} - {formatSize(verificationDocument.size)}
                  </small>
                </span>
                <span className="admin-company-document__actions">
                  {canPreview ? (
                    <button
                      className="admin-company-document__download admin-company-document__download--primary"
                      disabled={isBusy}
                      onClick={() => void openDocument(verificationDocument, 'view')}
                      type="button"
                    >
                      {isViewing ? content.opening : content.viewDocument}
                    </button>
                  ) : null}
                  <button
                    className="admin-company-document__download"
                    disabled={isBusy}
                    onClick={() => void openDocument(verificationDocument, 'download')}
                    type="button"
                  >
                    {isDownloading ? content.opening : content.download}
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
