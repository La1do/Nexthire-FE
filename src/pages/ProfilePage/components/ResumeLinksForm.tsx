import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ResumeLinksFormProps = {
  content: ProfileTranslations['sections']['resume']
  emptyResumeLabel: string
  isUploadingResume: boolean
  onChange: (field: 'linkedin' | 'portfolio', value: string) => void
  onUploadResume: (file: File) => void
  onRemoveResume: () => void
  profile: CandidateProfile
}

export function ResumeLinksForm({
  content,
  emptyResumeLabel,
  isUploadingResume,
  onChange,
  onRemoveResume,
  onUploadResume,
  profile,
}: ResumeLinksFormProps) {
  const resumeInputRef = useRef<HTMLInputElement | null>(null)

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      onUploadResume(file)
    }
  }

  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-resume-file">
        <span>{content.fileLabel}</span>
        <div>
          <strong>{profile.resumeFile || emptyResumeLabel}</strong>
          <span>
            <button
              disabled={isUploadingResume}
              onClick={() => resumeInputRef.current?.click()}
              type="button"
            >
              {isUploadingResume ? content.uploadingFileLabel : content.uploadFileLabel}
            </button>
            <button
              aria-label={content.removeFileLabel}
              disabled={!profile.defaultCvId || isUploadingResume}
              onClick={onRemoveResume}
              type="button"
            >
              x
            </button>
          </span>
          <input
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={handleResumeChange}
            ref={resumeInputRef}
            type="file"
          />
        </div>
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
