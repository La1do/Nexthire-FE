import { AxiosError, AxiosHeaders } from 'axios'
import type { ApiErrorEnvelope } from '../../lib/api/apiError'

/**
 * Axios-shaped mock errors (`isAxiosError(error) && error.response.status === <status>`),
 * so callers treat a mock 403/404/409 exactly like a backend one.
 * TODO(A1): switch to `mockForbidden` / `mockNotFound` / `mockConflict` from
 * `src/services/team/mock` once they land on develop (not available on develop yet).
 */
function createMockHttpError(status: number, statusText: string, code: string, message: string) {
  const data: ApiErrorEnvelope = { error: { code, message }, success: false }
  const config = { headers: new AxiosHeaders() }

  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, {
    config,
    data,
    headers: {},
    status,
    statusText,
  })
}

export function createForbiddenError(message = 'You do not have access to this job post.', code = 'FORBIDDEN') {
  return createMockHttpError(403, 'Forbidden', code, message)
}

export function createNotFoundError(message = 'Resource not found.', code = 'NOT_FOUND') {
  return createMockHttpError(404, 'Not Found', code, message)
}

export function createConflictError(message: string, code = 'CONFLICT') {
  return createMockHttpError(409, 'Conflict', code, message)
}
