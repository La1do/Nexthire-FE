import type {
  PublicCategory,
  PublicFeaturedCompany,
  PublicHomeStats,
  PublicJobListItem,
  JobWorkingType,
} from '../../../types/job.types'
import {
  formatPostedAt,
  formatSalary,
  initials,
  intlLocale,
  pickTone,
} from '../../_utils/jobFormat'
import type {
  CategoryIconKind,
  CategoryView,
  FeaturedCompanyView,
  HeroStatView,
  IndustryGroupView,
  JobCardView,
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
