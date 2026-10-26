import type { ApplicationResponse } from './application.types'

export type MatchingIdentity = Pick<ApplicationResponse, 'jobId' | 'candidateId' | 'candidateCvId'> & { applicationId: string }
export type MatchingStatus = MatchingIdentity & {
  schemaVersion: 'matching-status-v1'
  resultId: string
  matchRequestId: string | null
  status: 'SUCCEEDED' | 'FAILED'
  createdAt: string
  scoringStatus: 'NOT_AVAILABLE'
}
export class InvalidMatchingStatusError extends Error {}

export function validateMatchingIdentity(value: unknown, expected: MatchingIdentity): void {
  if (!value || typeof value !== 'object') throw new InvalidMatchingStatusError('Missing matching identity')
  const row = value as Record<string, unknown>
  for (const key of ['applicationId', 'jobId', 'candidateId', 'candidateCvId'] as const) {
    if (typeof row[key] !== 'string' || !row[key] || row[key] !== expected[key]) {
      throw new InvalidMatchingStatusError('Matching identity mismatch')
    }
  }
}

export function parseMatchingStatusEnvelope(payload: unknown, expected: MatchingIdentity): MatchingStatus | null {
  if (!payload || typeof payload !== 'object') throw new InvalidMatchingStatusError('Invalid status envelope')
  const envelope = payload as Record<string, unknown>
  if (envelope.success !== true || !('data' in envelope)) throw new InvalidMatchingStatusError('Invalid status envelope')
  if (envelope.data === null) return null
  validateMatchingIdentity(envelope.data, expected)
  const row = envelope.data as Record<string, unknown>
  if (row.schemaVersion !== 'matching-status-v1' || row.scoringStatus !== 'NOT_AVAILABLE' ||
    typeof row.resultId !== 'string' || !row.resultId ||
    !(row.matchRequestId === null || (typeof row.matchRequestId === 'string' && row.matchRequestId)) ||
    (row.status !== 'SUCCEEDED' && row.status !== 'FAILED') ||
    typeof row.createdAt !== 'string' || !Number.isFinite(Date.parse(row.createdAt))) {
    throw new InvalidMatchingStatusError('Invalid matching status')
  }
  // Project only lifecycle fields; historical numeric extras can never reach the UI.
  return {
    schemaVersion: 'matching-status-v1', ...expected, resultId: row.resultId,
    matchRequestId: row.matchRequestId as string | null, status: row.status,
    createdAt: row.createdAt, scoringStatus: 'NOT_AVAILABLE',
  }
}
