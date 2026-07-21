import { useRef } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile, ProfileCompletion } from '../types'

type ProfileHeroProps = {
  completion: ProfileCompletion
  content: ProfileTranslations['hero']
  hasUnsavedChanges: boolean
  isUploadingAvatar: boolean
  isSaving: boolean
  onSave: () => void
  onAvatarUpload: (file: File) => void
  profile: CandidateProfile
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProfileHero({
  completion,
  content,
  hasUnsavedChanges,
  isUploadingAvatar,
  isSaving,
  onAvatarUpload,
  onSave,
  profile,
}: ProfileHeroProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const progressStyle = {
    '--profile-progress': `${completion.percent}%`,
  } as CSSProperties

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      onAvatarUpload(file)
    }
  }

  return (
    <section className="profile-hero profile-card-motion">
      <div className="profile-avatar-wrap">
        <span className="profile-avatar">{getInitials(profile.name)}</span>
        <button
          aria-label={content.avatarAction}
          className="profile-avatar-action"
          disabled={isUploadingAvatar}
          onClick={() => avatarInputRef.current?.click()}
          type="button"
        />
        <input
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleAvatarChange}
          ref={avatarInputRef}
          type="file"
        />
      </div>

      <div className="profile-hero-main">
        <div className="profile-hero-heading">
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.headline}</p>
          </div>
          <span className={hasUnsavedChanges ? 'profile-save-state profile-save-state-dirty' : 'profile-save-state'}>
            {hasUnsavedChanges ? content.unsaved : content.saved}
          </span>
        </div>

        <div className="profile-progress-row">
          <div aria-label={`${content.completionLabel} ${completion.percent}%`} className="profile-progress" style={progressStyle}>
            <span />
          </div>
          <strong>{completion.percent}%</strong>
        </div>

        <div className="profile-hero-actions">
          <button disabled={isSaving} onClick={onSave} type="button">{content.save}</button>
          <a href="/profile">{content.viewPublic}</a>
        </div>
      </div>
    </section>
  )
}
