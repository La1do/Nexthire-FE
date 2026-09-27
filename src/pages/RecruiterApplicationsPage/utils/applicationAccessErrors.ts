import { AxiosError, AxiosHeaders, isAxiosError } from 'axios'

/**
 * Access errors for the per-JD CV page. They are Axios-shaped on purpose so the
 * guard treats a real BE 403 and a mock/service-layer 403 exactly the same way.
 */

export const FORBIDDEN_STATUS = 403
export const UNAUTHORIZED_STATUS = 401

export function createForbiddenError(message = 'You do not have access to this job post.') {
  const headers = new AxiosHeaders()
  const config = { headers }

  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, undefined, {
    config,
    data: {
      error: { code: 'FORBIDDEN', message },
      success: false,
    },
    headers: {},
    status: FORBIDDEN_STATUS,
    statusText: 'Forbidden',
  })
}

export function getErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined
}

export function isForbiddenError(error: unknown) {
  return getErrorStatus(error) === FORBIDDEN_STATUS
}

export function isUnauthorizedError(error: unknown) {
  return getErrorStatus(error) === UNAUTHORIZED_STATUS
}

export function isClientError(error: unknown) {
  const status = getErrorStatus(error)
  return status !== undefined && status >= 400 && status < 500
}
