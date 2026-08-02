import { useState } from 'react'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { adminCompaniesService } from '../../../services/admin'
import type { CompanyVerificationDocument } from '../../../types/admin.types'

type Props = { companyId: string; content: AdminCompaniesTranslations['detail']; documents: CompanyVerificationDocument[]; isError: boolean; isLoading: boolean }
const formatSize = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`

export function CompanyDocumentsCard({ companyId, content, documents, isError, isLoading }: Props) {
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState(false)
  const openDocument = async (document: CompanyVerificationDocument) => {
    setOpeningId(document.id)
    setDownloadError(false)
    try {
      const download = await adminCompaniesService.getVerificationDocumentDownload(companyId, document.documentId)
      window.open(download.url, '_blank', 'noopener,noreferrer')
    } catch {
      setDownloadError(true)
    } finally { setOpeningId(null) }
  }
  return <section aria-labelledby="company-documents-title" className="admin-company-panel"><header className="admin-company-panel__header"><h2 id="company-documents-title">{content.documentsTitle}</h2><p>{content.documentsDescription}</p></header>{downloadError ? <p className="admin-company-panel-state admin-company-panel-state--error" role="alert">{content.documentsError}</p> : null}{isLoading ? <p className="admin-company-panel-state">{content.documentsLoading}</p> : isError ? <p className="admin-company-panel-state admin-company-panel-state--error">{content.documentsError}</p> : documents.length === 0 ? <p className="admin-company-panel-state">{content.documentsEmpty}</p> : <ul className="admin-company-documents">{documents.map((document) => <li className="admin-company-document" key={document.id}><span aria-hidden="true" className="admin-company-document__icon">▤</span><span className="admin-company-document__name"><strong>{document.fileName}</strong><small>{document.type} · {formatSize(document.size)}</small></span><button className="admin-company-document__download" disabled={openingId === document.id} onClick={() => void openDocument(document)} type="button">{openingId === document.id ? content.opening : content.download}</button></li>)}</ul>}</section>
}
