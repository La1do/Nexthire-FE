// Shared formatting helpers for public job data. Used by the Home mappers and
// the Job Detail mappers so salary/date/logo formatting stays consistent.

export type LogoTone = 'blue' | 'coral' | 'green' | 'violet'

export const LOGO_TONES: ReadonlyArray<LogoTone> = ['blue', 'coral', 'green', 'violet']

// Stable tone from an id/name so a company keeps the same colour across renders.
export function pickTone(seed: string): LogoTone {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return LOGO_TONES[hash % LOGO_TONES.length]
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NH'
  )
}

const COMPACT_LOCALE: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
}

export function intlLocale(locale: string): string {
  return COMPACT_LOCALE[locale] ?? locale
}

// Salary fields shared by list items and job detail.
export type SalaryFields = {
  isSalaryVisible: boolean
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
}

export function formatSalary(job: SalaryFields, locale: string, negotiable: string): string {
  if (!job.isSalaryVisible || job.salaryMin == null) {
    return negotiable
  }

  const formatter = new Intl.NumberFormat(intlLocale(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  const min = formatter.format(job.salaryMin)

  if (job.salaryMax == null || job.salaryMax === job.salaryMin) {
    return `${min} ${job.salaryCurrency}`
  }

  return `${min}–${formatter.format(job.salaryMax)} ${job.salaryCurrency}`
}

export type PostedLabels = {
  postedJustNow: string
  postedPrefix: string
  postedSuffix: string
}

const RELATIVE_UNITS: ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'day', ms: 86_400_000 },
  { unit: 'hour', ms: 3_600_000 },
  { unit: 'minute', ms: 60_000 },
]

export function formatPostedAt(
  publishedAt: string | null,
  locale: string,
  labels: PostedLabels,
): string {
  if (!publishedAt) {
    return labels.postedJustNow
  }

  const published = new Date(publishedAt).getTime()
  if (Number.isNaN(published)) {
    return labels.postedJustNow
  }

  const diff = published - Date.now()
  const absDiff = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' })

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (absDiff >= ms) {
      const value = Math.round(diff / ms)
      const relative = formatter.format(value, unit)
      return `${labels.postedPrefix}${relative}${labels.postedSuffix}`.trim()
    }
  }

  return labels.postedJustNow
}

// Absolute calendar date, e.g. deadline. Returns empty string when missing.
export function formatDate(value: string | null, locale: string): string {
  if (!value) {
    return ''
  }

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return ''
  }

  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(time)
}
