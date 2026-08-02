import { createContext } from 'react'
import type { Locale, Translations } from './types'

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  translations: Translations
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)
