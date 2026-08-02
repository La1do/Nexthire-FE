import { useEffect, useState } from 'react'

type AdminUserAvatarProps = {
  avatarUrl?: string | null
  name: string
  size?: 'medium' | 'large'
}

function getInitials(name: string) {
  const normalizedName = name.trim()
  if (!normalizedName) return '?'

  return normalizedName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase()
}

export function AdminUserAvatar({ avatarUrl, name, size = 'medium' }: AdminUserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => setImageFailed(false), [avatarUrl])

  const showImage = Boolean(avatarUrl?.trim()) && !imageFailed

  return (
    <span className={`admin-user-avatar admin-user-avatar--${size}`}>
      {showImage ? (
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={avatarUrl ?? undefined}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
