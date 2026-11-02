import type { ApplicationResponse } from '../../../types/application.types'
import { InvalidMatchingStatusError, parseMatchingStatusEnvelope, validateMatchingIdentity, type MatchingIdentity } from '../../../types/matching-status.types'

type PollOptions = {
  identity: MatchingIdentity
  requestId: string | null
  signal: AbortSignal
  readStatus: (signal: AbortSignal) => Promise<unknown>
  readApplication: (signal: AbortSignal) => Promise<ApplicationResponse>
  pause?: (signal: AbortSignal) => Promise<void>
  attempts?: number
}
export type MatchingOutcome = 'succeeded' | 'failed' | 'parseFailed' | 'parseReady' | 'timeout'

export function pauseMatchingPoll(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const finish = () => { signal.removeEventListener('abort', abort); resolve() }
    const timer = setTimeout(finish, 4000)
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    signal.addEventListener('abort', abort, { once: true })
  })
}

export async function pollMatchingStatus({ identity, requestId, signal, readStatus, readApplication,
  pause = pauseMatchingPoll, attempts = 22 }: PollOptions): Promise<MatchingOutcome> {
  let lastTransientError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    signal.throwIfAborted()
    try {
      const application = await readApplication(signal)
      signal.throwIfAborted()
      validateMatchingIdentity({ ...application, applicationId: application.id }, identity)
      if (application.cvParseStatus === 'FAILED') return 'parseFailed'
      if (requestId === null) {
        // No correlation ID: CV readiness is not matching completion.
        if (application.cvParseStatus === 'PARSED') return 'parseReady'
      } else {
        const result = parseMatchingStatusEnvelope(await readStatus(signal), identity)
        signal.throwIfAborted()
        if (result?.matchRequestId === requestId) return result.status === 'SUCCEEDED' ? 'succeeded' : 'failed'
      }
      lastTransientError = undefined
    } catch (error) {
      signal.throwIfAborted()
      if (error instanceof InvalidMatchingStatusError) throw error
      const status = (error as { response?: { status?: number } } | null)?.response?.status
      // Retry only transient GET failures, within the same attempt/deadline budget.
      // Authorization/not-found/other client errors fail promptly. POST is never retried.
      if (status !== undefined && status !== 408 && status !== 429 && status < 500) throw error
      lastTransientError = error
    }
    if (attempt + 1 < attempts) await pause(signal)
  }
  if (lastTransientError !== undefined) throw lastTransientError
  return 'timeout'
}

export function validateMatchRequest(payload: unknown, applicationId: string): { id: string | null } {
  if (!payload || typeof payload !== 'object') throw new InvalidMatchingStatusError('Invalid match request')
  const row = payload as Record<string, unknown>
  if (row.applicationId !== applicationId ||
    !(((row.status === 'PENDING' || row.status === 'PROCESSING') && typeof row.id === 'string' && row.id) ||
      (row.status === 'WAITING_FOR_CV_PARSE' && row.id === null))) {
    throw new InvalidMatchingStatusError('Invalid match request identity/status')
  }
  return { id: row.id as string | null }
}
