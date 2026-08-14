import type { AuthUser } from '../../services/auth.service'

function normalizeAvatarUrl(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function getAvatarSources(...values: Array<string | null | undefined>): string[] {
  const sources: string[] = []

  values.forEach((value) => {
    const normalized = normalizeAvatarUrl(value)
    if (normalized && !sources.includes(normalized)) {
      sources.push(normalized)
    }
  })

  return sources
}

export function getCandidateAvatarSources(user: AuthUser): string[] {
  return getAvatarSources(user.candidateAvatarUrl, user.providerAvatarUrl)
}

export function getUserAvatarSources(user: AuthUser): string[] {
  if (user.role === 'CANDIDATE') {
    return getCandidateAvatarSources(user)
  }

  if (user.role === 'RECRUITER') {
    return getAvatarSources(user.logoUrl, user.avatarUrl)
  }

  return getAvatarSources(user.avatarUrl, user.logoUrl)
}

export function getUserInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
