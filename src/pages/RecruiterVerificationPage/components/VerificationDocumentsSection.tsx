import { useState } from 'react'
import type { DragEvent } from 'react'
import type { RecruiterVerificationTranslations } from '../../../i18n/types'
import type {
  CompanyVerificationDocument,
  CompanyVerificationDocumentType,
} from '../../../types/company.types'
import type { QueuedVerificationDocument } from '../types'

type VerificationDocumentsSectionProps = {
  deletingDocumentId: string | null
  disabled: boolean
  documents: CompanyVerificationDocument[]
  error?: string
  onDelete: (document: CompanyVerificationDocument) => void
  onFiles: (files: FileList | File[]) => void
  onRemoveQueued: (id: string) => void
  onTypeChange: (type: CompanyVerificationDocumentType) => void
  queuedDocuments: QueuedVerificationDocument[]
  selectedType: CompanyVerificationDocumentType
  translations: RecruiterVerificationTranslations['documents']
}

function formatSize(size: number, template: string) {
  return template.replace('{size}', (size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2))
}

function getExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.slice(0, 4).toUpperCase()
  return extension || 'FILE'
}

export function VerificationDocumentsSection({
  deletingDocumentId,
  disabled,
  documents,
  error,
  onDelete,
  onFiles,
  onRemoveQueued,
  onTypeChange,
  queuedDocuments,
  selectedType,
  translations,
}: VerificationDocumentsSectionProps) {
  const [isDragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    if (!disabled && event.dataTransfer.files.length > 0) {
      onFiles(event.dataTransfer.files)
    }
  }

  return (
    <section className="verification-section verification-section--documents" id="verification-documents">
      <div className="verification-section__heading">
        <span aria-hidden="true">02</span>
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
      </div>

      <div className="verification-document-controls">
        <label className="verification-document-type">
          <span>{translations.typeLabel}</span>
          <select
            disabled={disabled}
            onChange={(event) => onTypeChange(event.target.value as CompanyVerificationDocumentType)}
            value={selectedType}
          >
            {Object.entries(translations.types).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label
          className={`verification-dropzone${isDragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}${error ? ' is-error' : ''}`}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <span className="verification-dropzone__icon" aria-hidden="true">+</span>
          <span>
            <strong>{translations.dropTitle}</strong>
            <small>{translations.dropHint}</small>
          </span>
          <em>{translations.uploadAction}</em>
          <input
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp"
            disabled={disabled}
            multiple
            onChange={(event) => {
              if (event.target.files) onFiles(event.target.files)
              event.currentTarget.value = ''
            }}
            type="file"
          />
        </label>
        <small className="verification-document-error" role={error ? 'alert' : undefined}>{error ?? ' '}</small>
      </div>

      {queuedDocuments.length > 0 ? (
        <div className="verification-document-group">
          <h3>{translations.queuedTitle}</h3>
          <ul className="verification-document-list">
            {queuedDocuments.map((document) => (
              <li className="verification-document-row is-queued" key={document.id}>
                <span className="verification-document-row__type">{getExtension(document.file.name)}</span>
                <span className="verification-document-row__copy">
                  <strong>{document.file.name}</strong>
                  <small>
                    {translations.types[document.type]} · {formatSize(document.file.size, translations.fileSize)}
                  </small>
                </span>
                <button
                  aria-label={`${translations.removeQueued}: ${document.file.name}`}
                  disabled={disabled}
                  onClick={() => onRemoveQueued(document.id)}
                  title={translations.removeQueued}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="verification-document-group">
        <h3>{translations.attachedTitle}</h3>
        {documents.length > 0 ? (
          <ul className="verification-document-list">
            {documents.map((document) => {
              const isDeleting = deletingDocumentId === document.documentId
              const fileName = document.fileName ?? translations.types[document.type]
              const fileSize = document.size === undefined
                ? ''
                : ` · ${formatSize(document.size, translations.fileSize)}`
              return (
                <li className="verification-document-row" key={document.id}>
                  <span className="verification-document-row__type">
                    {document.fileName ? getExtension(document.fileName) : 'DOC'}
                  </span>
                  <span className="verification-document-row__copy">
                    <strong>{fileName}</strong>
                    <small>
                      {translations.types[document.type]}{fileSize}
                    </small>
                  </span>
                  <button
                    aria-label={`${translations.deleteAttached}: ${fileName}`}
                    data-state={isDeleting ? 'loading' : 'default'}
                    disabled={disabled || isDeleting}
                    onClick={() => onDelete(document)}
                    title={isDeleting ? translations.deleting : translations.deleteAttached}
                    type="button"
                  >
                    <span aria-hidden="true">{isDeleting ? '…' : '×'}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="verification-document-empty">
            <span aria-hidden="true">DOC</span>
            <div>
              <strong>{translations.emptyTitle}</strong>
              <p>{translations.emptyDescription}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
