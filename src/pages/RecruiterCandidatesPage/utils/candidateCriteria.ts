import type { ApplicationStatus } from '../../../types/application.types'
import type { CandidateCriteria, CandidateSort } from '../types'

export const CANDIDATE_STATUS_ORDER: ReadonlyArray<ApplicationStatus> = ['SUBMITTED', 'OFFERED', 'REJECTED', 'CANCELLED']

const SORTS: ReadonlyArray<CandidateSort> = ['lastAppliedAt', 'bestMatchScore', 'applicationCount', 'candidateName']

export const DEFAULT_CANDIDATE_CRITERIA: CandidateCriteria = { query: '', sort: 'lastAppliedAt', status: 'all' }

function isStatus(value: string | null): value is ApplicationStatus {
  return CANDIDATE_STATUS_ORDER.some((status) => status === value)
}

function isSort(value: string | null): value is CandidateSort {
  return SORTS.some((sort) => sort === value)
}

export function readCandidateCriteria(searchParams: URLSearchParams): CandidateCriteria {
  const status = searchParams.get('status')
  const sort = searchParams.get('sort')

  return {
    query: searchParams.get('search') ?? '',
    sort: isSort(sort) ? sort : DEFAULT_CANDIDATE_CRITERIA.sort,
    status: isStatus(status) ? status : 'all',
  }
}

export function writeCandidateCriteria(criteria: CandidateCriteria) {
  const params = new URLSearchParams()
  const query = criteria.query.trim()

  if (query) params.set('search', query)
  if (criteria.status !== 'all') params.set('status', criteria.status)
  if (criteria.sort !== DEFAULT_CANDIDATE_CRITERIA.sort) params.set('sort', criteria.sort)

  return params
}
