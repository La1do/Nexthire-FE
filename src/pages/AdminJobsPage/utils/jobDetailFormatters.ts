import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow } from '../types'

export function formatAdminJobDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatAdminJobSalary(
  item: AdminJobRow,
  content: AdminJobsTranslations['detail'],
) {
  if (!item.isSalaryVisible) return content.salaryHidden
  if (item.salaryMin == null && item.salaryMax == null) return content.noData

  const currency = item.salaryCurrency || 'VND'
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

  if (item.salaryMin != null && item.salaryMax != null) {
    return `${formatter.format(item.salaryMin)} – ${formatter.format(item.salaryMax)}`
  }

  return formatter.format(item.salaryMin ?? item.salaryMax ?? 0)
}

export function getTranslatedValue(
  value: string | null | undefined,
  labels: Record<string, string>,
  fallback: string,
) {
  if (!value) return fallback
  return labels[value] ?? value.replaceAll('_', ' ')
}
