import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../context'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { jobService } from '../../../services/job.service'
import type { ApiMeta } from '../../../types/job.types'
import {
  DEFAULT_RECRUITER_JOB_COUNTS,
  getStatusQuery,
} from '../utils/recruiterJobsData'
import { useRecruiterJobsStore } from './useRecruiterJobsStore'

const DEFAULT_META: ApiMeta = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1,
}

export function useRecruiterJobs(errorFallback: string) {
  const { user } = useAuth()
  const {
    applySearch,
    clearFilters,
    filters,
    searchInput,
    setPage,
    setSearchInput,
    setSort,
    setStatus,
  } = useRecruiterJobsStore()
  const jobsQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => jobService.getRecruiterJobs({
      limit: filters.limit,
      page: filters.page,
      q: filters.q || undefined,
      sort: filters.sort,
      status: getStatusQuery(filters.status),
    }),
    queryKey: ['recruiter-jobs', user?.id ?? 'anonymous', filters],
  })
  const countsQuery = useQuery({
    queryFn: () => jobService.getRecruiterJobStatusCounts(),
    queryKey: ['recruiter-job-status-counts', user?.id ?? 'anonymous'],
  })
  const loadJobs = async () => {
    await Promise.all([jobsQuery.refetch(), countsQuery.refetch()])
  }
  const error = jobsQuery.error
    ? getApiErrorEnvelope(jobsQuery.error)?.error.message ?? errorFallback
    : undefined

  return {
    applySearch,
    clearFilters,
    counts: {
      ...DEFAULT_RECRUITER_JOB_COUNTS,
      ...countsQuery.data,
    },
    error,
    filters,
    isLoading: jobsQuery.isPending || jobsQuery.isFetching,
    jobs: jobsQuery.data?.data ?? [],
    loadJobs,
    meta: jobsQuery.data?.meta ?? DEFAULT_META,
    searchInput,
    setPage,
    setSearchInput,
    setSort,
    setStatus,
  }
}
