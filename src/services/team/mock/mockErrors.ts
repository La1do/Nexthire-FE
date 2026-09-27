import { AxiosError, AxiosHeaders } from 'axios'
import type { ApiErrorEnvelope } from '../../../lib/api/apiError'

/**
 * Axios-shaped error for mock services: `axios.isAxiosError(error) === true`,
 * `error.response.status` and `getApiErrorCode(error)` work exactly like a real API failure.
 * Reuse from any per-feature mock file:
 *
 *   import { mockForbidden } from '../team/mock'
 *   throw mockForbidden('JOB.NOT_ASSIGNED', 'This job is not assigned to you.')
 */
export function createMockApiError(status: number, code: string, message: string): AxiosError<ApiErrorEnvelope> {
  const data: ApiErrorEnvelope = { success: false, error: { code, message } }
  const config = { headers: new AxiosHeaders() }

  return new AxiosError<ApiErrorEnvelope>(message, String(status), config, null, {
    config,
    data,
    headers: {},
    status,
    statusText: code,
  })
}

export function mockUnauthorized(code = 'AUTH.UNAUTHORIZED', message = 'Mock session not found. Log in with a mock account.') {
  return createMockApiError(401, code, message)
}

export function mockForbidden(code = 'AUTH.FORBIDDEN', message = 'You do not have permission to access this resource.') {
  return createMockApiError(403, code, message)
}

export function mockNotFound(code = 'RESOURCE.NOT_FOUND', message = 'Resource not found.') {
  return createMockApiError(404, code, message)
}

export function mockConflict(code = 'RESOURCE.CONFLICT', message = 'The resource is not in a valid state for this action.') {
  return createMockApiError(409, code, message)
}
