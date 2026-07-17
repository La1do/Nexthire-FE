import type {
  PublicCategory,
  PublicFeaturedCompany,
  PublicHomeStats,
  PublicJobListItem,
  JobWorkingType,
} from '../../../types/job.types'
import type {
  CategoryIconKind,
  CategoryView,
  FeaturedCompanyView,
  HeroStatView,
  IndustryGroupView,
  JobCardView,
  LogoTone,
} from '../types'

// Labels the mappers need from i18n so no user-facing text is hardcoded here.
export type JobLabels = {
  workingType: Record<JobWorkingType, string>
  salaryNegotiable: string
  jobsCountSuffix: string
  rolesCountSuffix: string
  postedJustNow: string
  postedPrefix: string
  postedSuffix: string
}

const LOGO_TONES: ReadonlyArray<LogoTone> = ['blue', 'coral', 'green', 'violet']

// Stable tone from an id/name so a company keeps the same colour across renders.
function pickTone(seed: string): LogoTone {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return LOGO_TONES[hash % LOGO_TONES.length]
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NH'
}

const COMPACT_LOCALE: Record<string, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
}

function intlLocale(locale: string): string {
  return COMPACT_LOCALE[locale] ?? locale
}

function formatSalary(
  job: PublicJobListItem,
  locale: string,
  negotiable: string,
): string {
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

const RELATIVE_UNITS: ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'day', ms: 86_400_000 },
  { unit: 'hour', ms: 3_600_000 },
  { unit: 'minute', ms: 60_000 },
]

function formatPostedAt(
  publishedAt: string | null,
  locale: string,
  labels: JobLabels,
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

const CATEGORY_ICON_BY_SLUG: Record<string, CategoryIconKind> = {
  engineering: 'code',
  software: 'code',
  it: 'code',
  developer: 'code',
  design: 'design',
  ux: 'design',
  ui: 'design',
  data: 'data',
  analytics: 'data',
  ai: 'data',
  marketing: 'marketing',
  growth: 'marketing',
  sales: 'marketing',
  support: 'support',
  'customer-success': 'support',
  cs: 'support',
}

function iconFromSlug(slug: string): CategoryIconKind {
  const normalized = slug.toLowerCase()
  if (CATEGORY_ICON_BY_SLUG[normalized]) {
    return CATEGORY_ICON_BY_SLUG[normalized]
  }

  const matchKey = Object.keys(CATEGORY_ICON_BY_SLUG).find((key) => normalized.includes(key))
  return matchKey ? CATEGORY_ICON_BY_SLUG[matchKey] : 'briefcase'
}

export function mapJobToCard(
  job: PublicJobListItem,
  locale: string,
  labels: JobLabels,
): JobCardView {
  const company = job.companyName ?? '—'

  return {
    id: job.id,
    companyId: job.companyId,
    company,
    title: job.title,
    location: job.location,
    workMode: labels.workingType[job.workingType] ?? job.workingType,
    workingType: job.workingType,
    salary: formatSalary(job, locale, labels.salaryNegotiable),
    salarySortValue: job.isSalaryVisible ? job.salaryMax ?? job.salaryMin ?? 0 : 0,
    postedAt: formatPostedAt(job.publishedAt, locale, labels),
    postedSortValue: job.publishedAt ? new Date(job.publishedAt).getTime() : 0,
    tags: job.skills.slice(0, 3),
    categoryId: job.categoryId,
    verified: true,
    badgeTone: job.isSalaryVisible && job.salaryMin != null ? 'pink' : 'blue',
    logo: {
      alt: `${company} logo`,
      fallbackText: initials(company),
      src: job.companyLogoUrl ?? '',
      tone: pickTone(job.companyId || company),
    },
  }
}

export function mapFeaturedCompany(
  company: PublicFeaturedCompany,
  labels: JobLabels,
): FeaturedCompanyView {
  const name = company.companyName ?? '—'

  return {
    companyId: company.companyId,
    name,
    openRoles: `${company.activeJobCount} ${labels.rolesCountSuffix}`,
    logo: {
      alt: `${name} logo`,
      fallbackText: initials(name),
      src: company.companyLogoUrl ?? '',
      tone: pickTone(company.companyId || name),
    },
  }
}

export function mapCategory(category: PublicCategory, labels: JobLabels): CategoryView {
  return {
    id: category.id,
    title: category.name,
    count: `${category.activeJobCount} ${labels.jobsCountSuffix}`,
    icon: iconFromSlug(category.slug),
  }
}

export function mapHeroStats(
  stats: PublicHomeStats,
  locale: string,
  labels: { openRoles: string; companies: string; categories: string },
): ReadonlyArray<HeroStatView> {
  const formatter = new Intl.NumberFormat(intlLocale(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  return [
    { value: formatter.format(stats.publishedJobCount), label: labels.openRoles },
    { value: formatter.format(stats.activeCompanyCount), label: labels.companies },
    { value: formatter.format(stats.categoryCount), label: labels.categories },
  ]
}

// Group live job cards by category for the "by industry" section.
// Category display names come from the categories endpoint.
export function groupJobsByCategory(
  jobs: ReadonlyArray<JobCardView>,
  categories: ReadonlyArray<CategoryView>,
): ReadonlyArray<IndustryGroupView> {
  const nameById = new Map(categories.map((category) => [category.id, category.title]))
  const groups = new Map<string, JobCardView[]>()

  for (const job of jobs) {
    const key = job.categoryId ?? '__uncategorized'
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(job)
    } else {
      groups.set(key, [job])
    }
  }

  return Array.from(groups.entries()).map(([key, groupJobs]) => ({
    categoryId: key === '__uncategorized' ? null : key,
    title: nameById.get(key) ?? groupJobs[0]?.tags[0] ?? '—',
    jobs: groupJobs,
  }))
}
