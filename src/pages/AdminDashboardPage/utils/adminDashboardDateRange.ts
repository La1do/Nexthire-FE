import type { AdminUserGrowthPeriod } from '../../../types/admin.types'

const periodDays: Record<AdminUserGrowthPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getAdminGrowthDateRange(
  period: AdminUserGrowthPeriod,
  currentDate = new Date(),
) {
  const to = new Date(currentDate)
  const from = new Date(currentDate)
  from.setDate(from.getDate() - (periodDays[period] - 1))

  return {
    from: formatLocalDate(from),
    to: formatLocalDate(to),
  }
}
