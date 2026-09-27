import { useQuery } from '@tanstack/react-query'
import { candidatesWorkspaceService } from '../../../services/applicationsWorkspace'
import { isClientError } from '../utils/candidateErrors'
import { candidateQueryKeys } from '../utils/candidateQueryKeys'
import { useCandidatesScope } from './useCandidatesScope'

/** Profile + in-scope JD history of one candidate (drawer). */
export function useCandidateDetail(candidateId: string | null) {
  const scope = useCandidatesScope()

  return useQuery({
    enabled: candidateId !== null,
    queryFn: () => candidatesWorkspaceService.getCandidate(candidateId ?? ''),
    queryKey: candidateQueryKeys.detail(scope, candidateId ?? ''),
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  })
}
