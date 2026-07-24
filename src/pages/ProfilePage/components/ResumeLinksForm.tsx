import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateCvParseStatus } from '../../../types/candidate.types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ResumeLinksFormProps = {
  cvError?: string
  cvMessage?: string
  content: ProfileTranslations['sections']['resume']
  emptyResumeLabel: string
  isStartingCvParse: boolean
  isUploadingResume: boolean
  onChange: (field: 'linkedin' | 'portfolio', value: string) => void
  onParseResume: () => void
  onUploadResume: (file: File) => void
  onRemoveResume: () => void
  profile: CandidateProfile
}

function FileIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m12 3-1.1 3.1a7 7 0 0 1-4.3 4.3L3.5 11.5l3.1 1.1a7 7 0 0 1 4.3 4.3L12 20l1.1-3.1a7 7 0 0 1 4.3-4.3l3.1-1.1-3.1-1.1a7 7 0 0 1-4.3-4.3Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg aria-hidden="true" className="profile-cv-spinner" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </svg>
  )
}

function normalizeStatus(status: CandidateCvParseStatus | null): CandidateCvParseStatus {
  return status ?? 'NOT_PARSED'
}

export function ResumeLinksForm({
  cvError,
  cvMessage,
  content,
  emptyResumeLabel,
  isStartingCvParse,
  isUploadingResume,
  onChange,
  onParseResume,
  onRemoveResume,
  onUploadResume,
  profile,
}: ResumeLinksFormProps) {
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setDragging] = useState(false)
  const hasResume = Boolean(profile.defaultCvId)
  const parseStatus = normalizeStatus(profile.defaultCvParseStatus)
  const isParsing = parseStatus === 'PARSING'
  const isBusy = isUploadingResume || isStartingCvParse || isParsing
  const managerState = cvError || parseStatus === 'FAILED'
    ? 'error'
    : isBusy
      ? 'loading'
      : hasResume
        ? 'success'
        : 'idle'

  function submitFile(file: File | undefined) {
    if (file) {
      onUploadResume(file)
    }
  }

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    submitFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)

    if (!isBusy) {
      submitFile(event.dataTransfer.files?.[0])
    }
  }

  const message = cvError ?? cvMessage ?? ''
  const messageTone = cvError ? 'error' : cvMessage ? 'success' : 'idle'

  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-cv-manager" data-state={managerState}>
        <div className="profile-cv-label-row">
          <span>{content.fileLabel}</span>
          {hasResume ? (
            <span className={`profile-cv-status profile-cv-status-${parseStatus.toLowerCase()}`}>
              {content.statusLabel}: {content.status[parseStatus]}
            </span>
          ) : null}
        </div>

        {hasResume ? (
          <div className="profile-cv-file-row">
            <span className="profile-cv-file-icon"><FileIcon /></span>
            <div className="profile-cv-file-main">
              <strong>{profile.resumeFile || emptyResumeLabel}</strong>
              <small>{content.dropHint}</small>
            </div>
            <div className="profile-cv-file-actions">
              <button
                className="profile-cv-replace-button"
                disabled={isBusy}
                onClick={() => resumeInputRef.current?.click()}
                type="button"
              >
                {isUploadingResume ? <LoadingIcon /> : <UploadIcon />}
                <span>{isUploadingResume ? content.uploadingFileLabel : content.replaceFileLabel}</span>
              </button>
              <button
                aria-label={content.removeFileLabel}
                className="profile-cv-remove-button"
                disabled={isBusy}
                onClick={onRemoveResume}
                title={content.removeFileLabel}
                type="button"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`profile-cv-dropzone${isDragging ? ' is-dragging' : ''}`}
            onDragEnter={(event) => {
              event.preventDefault()
              if (!isBusy) setDragging(true)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="profile-cv-dropzone-icon">{isUploadingResume ? <LoadingIcon /> : <UploadIcon />}</span>
            <div>
              <strong>{isUploadingResume ? content.uploadingFileLabel : content.dropTitle}</strong>
              <small>{content.dropHint}</small>
            </div>
            <button
              disabled={isUploadingResume}
              onClick={() => resumeInputRef.current?.click()}
              type="button"
            >
              {content.uploadFileLabel}
            </button>
          </div>
        )}

        {hasResume ? (
          <div className="profile-cv-parse-row">
            <div>
              <strong>{isParsing ? content.parsingLabel : content.parseHint}</strong>
              <small>{content.pdfRecommended}</small>
            </div>
            {parseStatus !== 'PARSED' ? (
              <button
                className="profile-cv-parse-button"
                disabled={isBusy}
                onClick={onParseResume}
                type="button"
              >
                {isStartingCvParse || isParsing ? <LoadingIcon /> : <SparkIcon />}
                <span>
                  {isStartingCvParse || isParsing
                    ? content.parsingLabel
                    : parseStatus === 'FAILED'
                      ? content.retryParseAction
                      : content.parseAction}
                </span>
              </button>
            ) : null}
          </div>
        ) : null}

        <p aria-live="polite" className={`profile-cv-message is-${messageTone}`}>{message}</p>

        <input
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleResumeChange}
          ref={resumeInputRef}
          type="file"
        />
      </div>

      <div className="profile-form-grid">
        <ProfileField label={content.portfolioLabel}>
          <input className="profile-control" onChange={(event) => onChange('portfolio', event.target.value)} value={profile.portfolio} />
        </ProfileField>
        <ProfileField label={content.linkedinLabel}>
          <input className="profile-control" onChange={(event) => onChange('linkedin', event.target.value)} value={profile.linkedin} />
        </ProfileField>
      </div>
    </ProfileSection>
  )
}
