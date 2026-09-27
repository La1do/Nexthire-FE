import { AxiosError, AxiosHeaders } from 'axios'
import type { ApiErrorEnvelope } from '../../lib/api/apiError'

/**
 * Axios-shaped 403 (`isAxiosError(error) && error.response.status === 403`), so
 * callers treat a mock 403 exactly like a backend 403.
 * TODO: switch to the shared helper once it lands.
 */
export function createForbiddenError(message = 'You do not have access to this job post.') {
  const data: ApiErrorEnvelope = { error: { code: 'FORBIDDEN', message }, success: false }
  const config = { headers: new AxiosHeaders() }

  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, {
    config,
    data,
    headers: {},
    status: 403,
    statusText: 'Forbidden',
  })
}
