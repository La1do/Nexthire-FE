import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type BasicInfoFormProps = {
  content: ProfileTranslations['sections']['basic']
  onChange: (field: 'headline' | 'location' | 'name' | 'summary', value: string) => void
  profile: CandidateProfile
}

export function BasicInfoForm({ content, onChange, profile }: BasicInfoFormProps) {
  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-form-grid">
        <ProfileField label={content.nameLabel}>
          <input className="profile-control" onChange={(event) => onChange('name', event.target.value)} value={profile.name} />
        </ProfileField>
        <ProfileField label={content.headlineLabel}>
          <input className="profile-control" onChange={(event) => onChange('headline', event.target.value)} value={profile.headline} />
        </ProfileField>
        <ProfileField label={content.locationLabel}>
          <input className="profile-control" onChange={(event) => onChange('location', event.target.value)} value={profile.location} />
        </ProfileField>
      </div>

      <ProfileField label={content.summaryLabel}>
        <textarea
          className="profile-control profile-textarea"
          maxLength={500}
          onChange={(event) => onChange('summary', event.target.value)}
          value={profile.summary}
        />
      </ProfileField>
      <p className="profile-character-count">{content.summaryCount.replace('{{count}}', String(profile.summary.length))}</p>
    </ProfileSection>
  )
}
