import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type { ApplicationResponse } from '../../../types/application.types'
import type { JobApplicationsRequest } from '../types'
import {
  fetchApplicationDetail,
  fetchJobApplicationStats,
  fetchJobApplications,
} from '../utils/tempApplicationsAdapter'
import { applicationQueryKeys } from '../utils/applicationQueryKeys'
import { useApplicationsScope } from './useApplicationsScope'

type PollingOptions = {
  refetchInterval: number | false
}

/** Tier 2: paged CVs of one JD. Only mounted after the access guard passed. */
export function useJobApplications(jobId: string, request: JobApplicationsRequest, { refetchInterval }: PollingOptions) {
  const scope = useApplicationsScope()

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchJobApplications(jobId, request),
    queryKey: applicationQueryKeys.jobApplications(scope, jobId, request),
    refetchInterval,
  })
}

export function useJobApplicationStats(jobId: string, query: string) {
  const scope = useApplicationsScope()

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchJobApplicationStats(jobId, query),
    queryKey: applicationQueryKeys.jobStats(scope, jobId, query),
  })
}

export function useJobApplicationDetail(applicationId: string | null, { refetchInterval }: PollingOptions) {
  const scope = useApplicationsScope()

  return useQuery({
    enabled: Boolean(applicationId),
    queryFn: () => fetchApplicationDetail(applicationId ?? ''),
    queryKey: applicationQueryKeys.applicationDetail(scope, applicationId ?? ''),
    refetchInterval,
  })
}

/** Cache helpers used after CV actions (open CV, AI match, decision). */
export function useJobApplicationsCache(jobId: string) {
  const queryClient = useQueryClient()
  const scope = useApplicationsScope()

  const refreshDetail = useCallback(
    (applicationId: string) =>
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.applicationDetail(scope, applicationId) }),
    [queryClient, scope],
  )

  const applyUpdatedApplication = useCallback(
    async (application: ApplicationResponse) => {
      queryClient.setQueryData(applicationQueryKeys.applicationDetail(scope, application.id), application)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationQueryKeys.jobApplicationsRoot(scope, jobId) }),
        queryClient.invalidateQueries({ queryKey: applicationQueryKeys.jobStatsRoot(scope, jobId) }),
        // Tier-1 counts (new / in progress / decided) change after a decision.
        queryClient.invalidateQueries({ queryKey: [...applicationQueryKeys.all, scope, 'jobs'] }),
      ])
    },
    [jobId, queryClient, scope],
  )

  return { applyUpdatedApplication, refreshDetail }
}
