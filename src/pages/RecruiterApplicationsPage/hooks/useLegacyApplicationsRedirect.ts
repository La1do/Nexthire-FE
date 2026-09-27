import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resolveApplicationJobId } from '../utils/applicationsWorkspaceData'
import { applicationQueryKeys } from '../utils/applicationQueryKeys'
import { getJobApplicationsHref } from '../utils/applicationRoutes'
import { useApplicationsScope } from './useApplicationsScope'

function buildJobApplicationsHref(jobId: string, searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams)
  nextParams.delete('jobId')
  return getJobApplicationsHref(jobId, nextParams)
}

/**
 * Keeps old deep links working after the two-tier split. Other pages still link
 * to `/recruiter/applications?jobId=...&applicationId=...` (or only
 * `applicationId`); those are forwarded to `/recruiter/applications/:jobId`.
 */
export function useLegacyApplicationsRedirect() {
  const navigate = useNavigate()
  const scope = useApplicationsScope()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacyJobId = searchParams.get('jobId')?.trim() || null
  const legacyApplicationId = searchParams.get('applicationId')?.trim() || null
  const shouldResolveJob = !legacyJobId && Boolean(legacyApplicationId)
  const applicationJobQuery = useQuery({
    enabled: shouldResolveJob,
    queryFn: () => resolveApplicationJobId(legacyApplicationId ?? ''),
    queryKey: applicationQueryKeys.applicationJob(scope, legacyApplicationId ?? ''),
    retry: false,
  })
  const resolvedJobId = legacyJobId ?? (shouldResolveJob ? applicationJobQuery.data : undefined)
  const isResolveFailed = shouldResolveJob && applicationJobQuery.isError

  useEffect(() => {
    if (resolvedJobId) {
      navigate(buildJobApplicationsHref(resolvedJobId, searchParams), { replace: true })
    }
  }, [navigate, resolvedJobId, searchParams])

  useEffect(() => {
    if (isResolveFailed) {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        nextParams.delete('applicationId')
        return nextParams
      }, { replace: true })
    }
  }, [isResolveFailed, setSearchParams])

  return { isRedirecting: Boolean(legacyJobId) || (shouldResolveJob && !isResolveFailed) }
}
