import type { HomeJobItem } from '../../i18n/types'
import { homeSampleJobs } from '../_mock/homeSampleJobs'

function removeDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Id-based hrefs for pages wired to the live API (Home).
export function createJobDetailHrefById(id: string) {
  return `/jobs/${id}`
}

export function createCompanyDetailHrefById(companyId: string) {
  return `/companies/${companyId}`
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

// Legacy sample job list for pages not yet wired to the API
// (JobDetail, Search, CompanyDetail). Sourced from the shared mock.
export function getHomeJobList() {
  const seenSlugs = new Set<string>()

  return homeSampleJobs.filter((job) => {
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
