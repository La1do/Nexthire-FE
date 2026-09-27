import { isAxiosError } from 'axios'

/**
 * Error classification for the per-JD access guard. The 403 itself is created
 * by the service (`src/services/applicationsWorkspace`) or returned by the BE;
 * both are Axios-shaped, so one check covers both.
 */

export function getErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined
}

export function isForbiddenError(error: unknown) {
  return getErrorStatus(error) === 403
}

export function isUnauthorizedError(error: unknown) {
  return getErrorStatus(error) === 401
}

export function isClientError(error: unknown) {
  const status = getErrorStatus(error)
  return status !== undefined && status >= 400 && status < 500
}
