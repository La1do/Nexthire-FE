import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { candidatesWorkspaceService } from '../../../services/applicationsWorkspace'
import type { CandidateListRequest } from '../types'
import { isClientError } from '../utils/candidateErrors'
import { candidateQueryKeys } from '../utils/candidateQueryKeys'
import { useCandidatesScope } from './useCandidatesScope'

export const CANDIDATES_PAGE_SIZE = 12

/** Candidates in the member's scope (scoping is done by the service). */
export function useCandidates(request: CandidateListRequest) {
  const scope = useCandidatesScope()

  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () =>
      candidatesWorkspaceService.listCandidates({
        limit: CANDIDATES_PAGE_SIZE,
        page: request.page,
        search: request.query.trim() || undefined,
        sortBy: request.sort,
        status: request.status === 'all' ? undefined : request.status,
      }),
    queryKey: candidateQueryKeys.list(scope, request),
    retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
  })
}
