import { useCallback, useEffect, useState } from 'react'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { jobService } from '../../../services/job.service'
import type {
  ApiMeta,
  RecruiterJobResponse,
  RecruiterJobStatusCounts,
} from '../../../types/job.types'
import type { RecruiterJobsFilters, RecruiterJobsStatusFilter } from '../types'
import {
  DEFAULT_RECRUITER_JOB_COUNTS,
  getStatusQuery,
} from '../utils/recruiterJobsData'

const DEFAULT_META: ApiMeta = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1,
}

const INITIAL_FILTERS: RecruiterJobsFilters = {
  limit: 10,
  page: 1,
  q: '',
  sort: 'latest',
  status: 'ALL',
}

export function useRecruiterJobs(errorFallback: string) {
  const [jobs, setJobs] = useState<RecruiterJobResponse[]>([])
  const [counts, setCounts] = useState<RecruiterJobStatusCounts>(DEFAULT_RECRUITER_JOB_COUNTS)
  const [filters, setFilters] = useState<RecruiterJobsFilters>(INITIAL_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [meta, setMeta] = useState<ApiMeta>(DEFAULT_META)
  const [error, setError] = useState<string | undefined>(undefined)
  const [isLoading, setLoading] = useState(true)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(undefined)

    const [jobsResult, countsResult] = await Promise.allSettled([
      jobService.getRecruiterJobs({
        limit: filters.limit,
        page: filters.page,
        q: filters.q || undefined,
        sort: filters.sort,
        status: getStatusQuery(filters.status),
      }),
      jobService.getRecruiterJobStatusCounts(),
    ])

    if (jobsResult.status === 'fulfilled') {
      setJobs(jobsResult.value.data)
      setMeta(jobsResult.value.meta)
    } else {
      setJobs([])
      setMeta(DEFAULT_META)
      setError(getApiErrorEnvelope(jobsResult.reason)?.error.message ?? errorFallback)
    }

    if (countsResult.status === 'fulfilled') {
      setCounts({ ...DEFAULT_RECRUITER_JOB_COUNTS, ...countsResult.value })
    }

    setLoading(false)
  }, [errorFallback, filters.limit, filters.page, filters.q, filters.sort, filters.status])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  const applySearch = useCallback((value: string) => {
    const nextSearch = value.trim()
    setSearchInput(nextSearch)
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: 1,
      q: nextSearch,
    }))
  }, [])

  const setStatus = useCallback((status: RecruiterJobsStatusFilter) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: 1,
      status,
    }))
  }, [])

  const setSort = useCallback((sort: RecruiterJobsFilters['sort']) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: 1,
      sort,
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setFilters(INITIAL_FILTERS)
  }, [])

  return {
    applySearch,
    clearFilters,
    counts,
    error,
    filters,
    isLoading,
    jobs,
    loadJobs,
    meta,
    searchInput,
    setPage,
    setSearchInput,
    setSort,
    setStatus,
  }
}
