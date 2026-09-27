import type { Locale } from '../../i18n/types'

const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  vi: 'vi-VN',
}

export function toIntlLocale(locale: Locale) {
  return INTL_LOCALES[locale]
}

export function formatCompanyDate(value: string, locale: Locale) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium' }).format(date)
}

export function formatCompanyDateTime(value: string, locale: Locale) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(toIntlLocale(locale), { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatCompanyMoney(amount: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(toIntlLocale(locale), { currency, maximumFractionDigits: 0, style: 'currency' }).format(amount)
}

/** Replaces `{key}` placeholders in a translated template. */
export function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}
