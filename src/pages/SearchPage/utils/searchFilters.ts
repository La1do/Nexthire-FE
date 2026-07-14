import type { HomeJobItem } from '../../../i18n/types'
import type { SearchQueryParams } from './searchParams'

function normalizeValue(value: string) {
  return value.trim().toLowerCase()
}

function getSalaryNumbers(salary: string) {
  return salary.match(/\d+/g)?.map(Number) ?? []
}

function getSalaryMax(salary: string) {
  return Math.max(...getSalaryNumbers(salary), 0)
}

export function getUniqueJobs(jobs: ReadonlyArray<HomeJobItem>) {
  const seenJobs = new Set<string>()

  return jobs.filter((job) => {
    const key = `${job.company}-${job.title}`

    if (seenJobs.has(key)) {
      return false
    }

    seenJobs.add(key)
    return true
  })
}

export function filterSearchJobs(jobs: ReadonlyArray<HomeJobItem>, params: SearchQueryParams) {
  const keyword = normalizeValue(params.keyword)
  const salaryMinimum = Number(params.salary)

  return jobs.filter((job) => {
    const searchableText = [job.title, job.company, job.field, job.location, job.workMode, ...job.tags]
      .map(normalizeValue)
      .join(' ')

    const matchesKeyword = !keyword || searchableText.includes(keyword)
    const matchesLocation = !params.location || job.location === params.location
    const matchesField = !params.field || job.field === params.field
    const matchesWorkMode = !params.workMode || job.workMode === params.workMode
    const matchesSalary = !salaryMinimum || getSalaryMax(job.salary) >= salaryMinimum

    return matchesKeyword && matchesLocation && matchesField && matchesWorkMode && matchesSalary
  })
}

export function sortSearchJobs(jobs: ReadonlyArray<HomeJobItem>, sort: string) {
  if (sort === 'salary') {
    return [...jobs].sort((firstJob, secondJob) => getSalaryMax(secondJob.salary) - getSalaryMax(firstJob.salary))
  }

  return [...jobs]
}
