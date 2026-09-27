import { useQuery } from '@tanstack/react-query'
import { isClientError } from '../utils/applicationAccessErrors'
import { fetchApplicationJobAccess } from '../utils/tempApplicationsAdapter'
import { applicationQueryKeys } from '../utils/applicationQueryKeys'
import { useApplicationsScope } from './useApplicationsScope'

/**
 * Tier 2 access check for one JD. Never served from cache: every mount (and
 * every jobId change) re-checks access before CV data may render.
 */
export function useApplicationJobAccess(jobId: string) {
  const scope = useApplicationsScope()

  return useQuery({
    enabled: jobId.length > 0,
    gcTime: 0,
    queryFn: () => fetchApplicationJobAccess(jobId),
    queryKey: applicationQueryKeys.jobAccess(scope, jobId),
    refetchOnMount: 'always',
    retry: (failureCount, error) => !isClientError(error) && failureCount < 1,
    staleTime: 0,
  })
}
