import { isAxiosError } from 'axios'

function getErrorStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined
}

/** 403 from the service (mock) or the backend: the member has no CV scope. */
export function isForbiddenError(error: unknown) {
  return getErrorStatus(error) === 403
}

/** 4xx errors are not retried automatically. */
export function isClientError(error: unknown) {
  const status = getErrorStatus(error)
  return status !== undefined && status >= 400 && status < 500
}
