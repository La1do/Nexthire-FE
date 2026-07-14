import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ResumeLinksFormProps = {
  content: ProfileTranslations['sections']['resume']
  onChange: (field: 'linkedin' | 'portfolio', value: string) => void
  onRemoveResume: () => void
  profile: CandidateProfile
}

export function ResumeLinksForm({ content, onChange, onRemoveResume, profile }: ResumeLinksFormProps) {
  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-resume-file">
        <span>{content.fileLabel}</span>
        <div>
          <strong>{profile.resumeFile}</strong>
          <button aria-label={content.removeFileLabel} onClick={onRemoveResume} type="button">x</button>
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
