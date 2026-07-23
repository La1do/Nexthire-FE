import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ContactInfoFormProps = {
  content: ProfileTranslations['sections']['contact']
  onChange: (field: 'contactEmail' | 'phone', value: string) => void
  profile: CandidateProfile
}

export function ContactInfoForm({ content, onChange, profile }: ContactInfoFormProps) {
  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-form-grid">
        <ProfileField hint={content.lockedHint} label={content.emailLabel}>
          <input
            className="profile-control"
            onChange={(event) => onChange('contactEmail', event.target.value)}
            type="email"
            value={profile.contactEmail}
          />
        </ProfileField>
        <ProfileField label={content.phoneLabel}>
          <input className="profile-control" onChange={(event) => onChange('phone', event.target.value)} value={profile.phone} />
        </ProfileField>
      </div>
    </ProfileSection>
  )
}
