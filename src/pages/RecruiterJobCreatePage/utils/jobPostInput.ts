
export function sanitizeUnsignedIntegerInput(value: string) {
  return value.replace(/\D/g, '')
}

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

  const deadline = new Date(parsed.year, parsed.month - 1, parsed.day, 23, 59, 59, 999)
  return deadline.getTime() > Date.now()
}
