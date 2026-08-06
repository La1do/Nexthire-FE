/**
 * Removes every character that is not an ASCII digit.
 * Used for salary and opening-count inputs so invalid characters never reach form state.
 */
export function sanitizeUnsignedIntegerInput(value: string) {
  return value.replace(/\D/g, '')
}

/**
 * Formats a numeric date input progressively as dd/mm/yyyy.
 * Examples: 3 -> 3, 3108 -> 31/08, 31082026 -> 31/08/2026.
 */
export function formatDisplayDateInput(value: string) {
  const digits = sanitizeUnsignedIntegerInput(value).slice(0, 8)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export type ParsedDisplayDate = {
  day: number
  month: number
  year: number
}

/**
 * Parses dd/mm/yyyy and rejects impossible calendar dates such as 31/02/2026.
 */
export function parseDisplayDate(value: string): ParsedDisplayDate | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())

  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return { day, month, year }
}

/**
 * Converts an API date/ISO value to dd/mm/yyyy without shifting the calendar day.
 */
export function formatApiDateToDisplay(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

  if (isoDateMatch) {
    return `${isoDateMatch[3]}/${isoDateMatch[2]}/${isoDateMatch[1]}`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

/**
 * Converts dd/mm/yyyy to an ISO timestamp at 17:00 local time, matching the
 * existing recruiter-job deadline behavior.
 */
export function createDeadlineIsoFromDisplayDate(value: string) {
  const parsed = parseDisplayDate(value)

  if (!parsed) {
    return null
  }

  const deadline = new Date(parsed.year, parsed.month - 1, parsed.day, 17, 0, 0, 0)
  return deadline.toISOString()
}

export function isFutureDisplayDate(value: string) {
  if (!value.trim()) {
    return true
  }

  const parsed = parseDisplayDate(value)

  if (!parsed) {
    return false
  }

  const today = new Date()
  const todayKey = today.getFullYear() * 10_000 + (today.getMonth() + 1) * 100 + today.getDate()
  const deadlineKey = parsed.year * 10_000 + parsed.month * 100 + parsed.day

  return deadlineKey > todayKey
}

export function formatNativeDateToDisplay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

export function formatDisplayDateToNative(value: string) {
  const parsed = parseDisplayDate(value)
  if (!parsed) return ''
  return `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`
}
