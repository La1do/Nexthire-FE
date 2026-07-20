import type { JobListQuery, JobWorkingType } from '../../../types/job.types'
import type { SearchQueryParams } from './searchParams'

const WORKING_TYPES = new Set<JobWorkingType>(['ONSITE', 'REMOTE', 'HYBRID'])

const SORTS = new Set<NonNullable<JobListQuery['sort']>>([
  'relevance',
  'latest',
  'deadline_asc',
  'salary_desc',
  'salary_asc',
])

// Translate the URL-driven search form params into a public jobs query.
// Values that don't map to a known API filter are simply dropped.
export function toJobListQuery(params: SearchQueryParams): JobListQuery {
  const query: JobListQuery = {}

  const keyword = params.keyword.trim()
  if (keyword) {
    query.q = keyword
  }

  if (params.location) {
    query.location = params.location
  }

  if (params.field) {
    query.categoryId = params.field
  }

  if (WORKING_TYPES.has(params.workMode as JobWorkingType)) {
    query.workingType = params.workMode as JobWorkingType
  }

  const salaryMin = Number(params.salary)
  if (Number.isFinite(salaryMin) && salaryMin > 0) {
    query.salaryMin = salaryMin
  }

  if (SORTS.has(params.sort as NonNullable<JobListQuery['sort']>)) {
    query.sort = params.sort as JobListQuery['sort']
  }

  return query
}
