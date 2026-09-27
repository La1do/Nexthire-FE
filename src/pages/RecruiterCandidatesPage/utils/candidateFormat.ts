import type { ApplicationMatchLevel } from '../../../types/application.types'

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function formatDate(value: string, locale: string, fallback: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function formatMatch(
  score: number | null,
  level: ApplicationMatchLevel | null,
  fallback: string,
  levelLabels: Record<ApplicationMatchLevel, string>,
) {
  if (score == null) {
    return fallback
  }

  return level ? `${score} · ${levelLabels[level]}` : String(score)
}
