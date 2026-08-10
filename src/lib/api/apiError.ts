import axios from 'axios'

export type ApiErrorDetail = {
  field: string
  issue: string
}

export type ApiErrorEnvelope = {
  success: false
  error: {
    code: string
    message: string
    details?: ReadonlyArray<ApiErrorDetail>
  }
  requestId?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) {
    return false
  }

  return typeof value.error.code === 'string'
}

export function getApiErrorEnvelope(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return undefined
  }

  const data = error.response?.data
  return isApiErrorEnvelope(data) ? data : undefined
}

export function getApiErrorCode(error: unknown) {
  return getApiErrorEnvelope(error)?.error.code
}
