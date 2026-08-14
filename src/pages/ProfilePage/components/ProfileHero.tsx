import { useRef } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile, ProfileCompletion } from '../types'
import { getAvatarSources, getUserInitials } from '../../_utils/userAvatar'
import { useResolvedAvatar } from '../../../hooks/useResolvedAvatar'

type ProfileHeroProps = {
  completion: ProfileCompletion
  content: ProfileTranslations['hero']
  hasUnsavedChanges: boolean
  fallbackAvatarUrl?: string | null
  isUploadingAvatar: boolean
  onAvatarUpload: (file: File) => void
  profile: CandidateProfile
}


export function ProfileHero({
  completion,
  content,
  fallbackAvatarUrl,
  hasUnsavedChanges,
  isUploadingAvatar,
  onAvatarUpload,
  profile,
}: ProfileHeroProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarSources = getAvatarSources(profile.avatarUrl, fallbackAvatarUrl)
  const { src: avatarSource, onError: handleAvatarError } = useResolvedAvatar(avatarSources)
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
        <button
          aria-label={content.avatarAction}
          className="profile-avatar-button"
          disabled={isUploadingAvatar}
          onClick={() => avatarInputRef.current?.click()}
          type="button"
        >
          <span className="profile-avatar">
            {avatarSource ? (
              <img
                alt={profile.name || content.avatarAction}
                onError={() => handleAvatarError(avatarSource)}
                src={avatarSource}
              />
            ) : (
              getUserInitials(profile.name)
            )}
          </span>
          <span aria-hidden="true" className="profile-avatar-action" />
        </button>
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

      </div>
    </section>
  )
}
