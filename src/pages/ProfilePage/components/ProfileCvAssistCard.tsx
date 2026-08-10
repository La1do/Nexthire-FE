import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateCvParseStatus } from '../../../types/candidate.types'
import type { CandidateProfile } from '../types'

type ProfileCvAssistCardProps = {
  content: ProfileTranslations['cvAssist']
  isProfileSparse: boolean
  isStartingCvParse: boolean
  isUploadingResume: boolean
  onDismiss: () => void
  onParseResume: () => void
  onUploadResume: (file: File) => void
  profile: CandidateProfile
}

function UploadMark() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
    </svg>
  )
}

function SparkMark() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m12 3-1.1 3.1a7 7 0 0 1-4.3 4.3L3.5 11.5l3.1 1.1a7 7 0 0 1 4.3 4.3L12 20l1.1-3.1a7 7 0 0 1 4.3-4.3l3.1-1.1-3.1-1.1a7 7 0 0 1-4.3-4.3Z" />
    </svg>
  )
}

function LoadingMark() {
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

export function ProfileCvAssistCard({
  content,
  isProfileSparse,
  isStartingCvParse,
  isUploadingResume,
  onDismiss,
  onParseResume,
  onUploadResume,
  profile,
}: ProfileCvAssistCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const hasResume = Boolean(profile.defaultCvId)
  const parseStatus = normalizeStatus(profile.defaultCvParseStatus)
  const isParsing = parseStatus === 'PARSING'
  const isParsed = parseStatus === 'PARSED'
  const isBusy = isUploadingResume || isStartingCvParse || isParsing
  const title = isParsed ? content.parsedTitle : hasResume ? content.readyTitle : content.title
  const description = isParsed
    ? content.parsedDescription
    : isProfileSparse
      ? content.descriptionSparse
      : content.description

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onUploadResume(file)
    }
    event.currentTarget.value = ''
  }

  return (
    <section className="profile-cv-assist-card profile-card-motion" data-state={isBusy ? 'loading' : isParsed ? 'success' : 'idle'}>
      <span className="profile-cv-assist-mark" aria-hidden="true">
        {isBusy ? <LoadingMark /> : isParsed ? <SparkMark /> : <UploadMark />}
      </span>

      <div className="profile-cv-assist-copy">
        <p>{content.eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
        <small>{content.hint}</small>
      </div>

      <div className="profile-cv-assist-actions">
        {!hasResume ? (
          <button
            className="profile-cv-assist-primary"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {isUploadingResume ? <LoadingMark /> : <UploadMark />}
            <span>{isUploadingResume ? content.uploadingAction : content.uploadAction}</span>
          </button>
        ) : !isParsed ? (
          <button
            className="profile-cv-assist-primary"
            disabled={isBusy}
            onClick={onParseResume}
            type="button"
          >
            {isBusy ? <LoadingMark /> : <SparkMark />}
            <span>{isBusy ? content.parsingAction : content.parseAction}</span>
          </button>
        ) : null}

        {hasResume ? (
          <button
            className="profile-cv-assist-secondary"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {content.replaceAction}
          </button>
        ) : null}

        {isProfileSparse ? (
          <button
            className="profile-cv-assist-quiet"
            disabled={isBusy}
            onClick={onDismiss}
            type="button"
          >
            {content.manualAction}
          </button>
        ) : null}
      </div>

      <input
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
    </section>
  )
}
