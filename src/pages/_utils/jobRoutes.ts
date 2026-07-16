import type { HomeJobItem, HomeTranslations } from '../../i18n/types'

function removeDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function createJobSlug(job: HomeJobItem) {
  const slug = removeDiacritics(`${job.company} ${job.title}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return slug || 'job'
}

export function createJobDetailHref(job: HomeJobItem) {
  return `/jobs/${createJobSlug(job)}`
}

export function createCompanySlug(company: string) {
  const slug = removeDiacritics(company)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return slug || 'company'
}

export function createCompanyDetailHref(company: string) {
  return `/companies/${createCompanySlug(company)}`
}

export function getHomeJobList(home: HomeTranslations) {
  const jobs = [
    ...home.jobs.items,
    ...home.industryJobs.groups.flatMap((group) => group.jobs),
  ]
  const seenSlugs = new Set<string>()

  return jobs.filter((job) => {
    const slug = createJobSlug(job)

    if (seenSlugs.has(slug)) {
      return false
    }

    seenSlugs.add(slug)
    return true
  })
}

export function findJobBySlug(jobs: ReadonlyArray<HomeJobItem>, slug: string) {
  return jobs.find((job) => createJobSlug(job) === slug)
}
