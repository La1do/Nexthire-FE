import type { CandidateListRequest } from '../types'

const ROOT = 'recruiter-candidates' as const

export const candidateQueryKeys = {
  all: [ROOT] as const,
  list: (scope: string, request: CandidateListRequest) => [ROOT, scope, 'list', request] as const,
  detail: (scope: string, candidateId: string) => [ROOT, scope, 'detail', candidateId] as const,
}
