import { getApiErrorCode } from '../lib/api/apiError'
import type { CommonTranslations } from './types'

export function getApiErrorMessage(
  error: unknown,
  apiErrors: CommonTranslations['apiErrors'],
) {
  const code = getApiErrorCode(error)

  if (!code) {
    return apiErrors.default
  }

  return apiErrors.byCode[code] ?? apiErrors.default
}
