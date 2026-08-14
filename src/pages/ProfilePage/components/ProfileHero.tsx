import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ChangeEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile, ProfileCompletion } from '../types'

type ProfileHeroProps = {
  authenticatedAvatarFallbackUrl?: string | null
  authenticatedAvatarUrl?: string | null
  avatarRefreshKey?: number
  completion: ProfileCompletion
  content: ProfileTranslations['hero']
  hasUnsavedChanges: boolean
  isUploadingAvatar: boolean
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
    .toUpperCase() || 'NH'
}

export function ProfileHero({
  authenticatedAvatarFallbackUrl,
  authenticatedAvatarUrl,
  avatarRefreshKey = 0,
  completion,
  content,
  hasUnsavedChanges,
  isUploadingAvatar,
  onAvatarUpload,
  profile,
}: ProfileHeroProps) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const avatarCandidates = [
    profile.avatarUrl?.trim(),
    authenticatedAvatarUrl?.trim(),
    authenticatedAvatarFallbackUrl?.trim(),
  ].filter((avatarUrl, index, values): avatarUrl is string => Boolean(avatarUrl) && values.indexOf(avatarUrl) === index)
  const [avatarCandidateIndex, setAvatarCandidateIndex] = useState(0)
  const avatarUrl = avatarCandidates[avatarCandidateIndex] ?? null
  const displayAvatarUrl = avatarUrl
    ? avatarRefreshKey > 0 && !avatarUrl.includes('?')
      ? `${avatarUrl}?v=${avatarRefreshKey}`
      : avatarUrl
    : null
  const showAvatarImage = Boolean(displayAvatarUrl)
  const progressStyle = {
    '--profile-progress': `${completion.percent}%`,
  } as CSSProperties

  useEffect(() => {
    setAvatarCandidateIndex(0)
  }, [authenticatedAvatarFallbackUrl, authenticatedAvatarUrl, profile.avatarUrl])

  function handleAvatarError() {
    setAvatarCandidateIndex((currentIndex) => currentIndex + 1)
  }

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
            {showAvatarImage ? (
              <img
                alt={profile.name || content.avatarAction}
                onError={handleAvatarError}
                src={displayAvatarUrl ?? ''}
              />
            ) : (
              getInitials(profile.name)
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
