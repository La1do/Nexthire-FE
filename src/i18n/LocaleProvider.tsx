import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { defaultLocale, getTranslations, isLocale } from './index'
import { LocaleContext } from './localeContext'
import type { Locale } from './types'

const LOCALE_STORAGE_KEY = 'nexhire_locale'

function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(storedLocale) ? storedLocale : null
  } catch {
    return null
  }
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [storedLocale] = useState(readStoredLocale)
  const [locale, setLocaleState] = useState<Locale>(storedLocale ?? defaultLocale)
  const [hasStoredLocalePreference, setHasStoredLocalePreference] = useState(() => storedLocale !== null)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    setHasStoredLocalePreference(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale

    if (!hasStoredLocalePreference) {
      return
    }

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Keep the selected locale in memory when localStorage is unavailable.
    }
  }, [hasStoredLocalePreference, locale])

  const translations = useMemo(() => getTranslations(locale), [locale])
  const value = useMemo(
    () => ({
      hasStoredLocalePreference,
      locale,
      setLocale,
      translations,
    }),
    [hasStoredLocalePreference, locale, setLocale, translations],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
