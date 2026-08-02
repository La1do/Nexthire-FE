import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { defaultLocale, getTranslations, isLocale } from './index'
import { LocaleContext } from './localeContext'
import type { Locale } from './types'

const LOCALE_STORAGE_KEY = 'nexhire_locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(storedLocale) ? storedLocale : defaultLocale
  } catch {
    return defaultLocale
  }
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Keep the selected locale in memory when localStorage is unavailable.
    }
  }, [locale])

  const translations = useMemo(() => getTranslations(locale), [locale])
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      translations,
    }),
    [locale, setLocale, translations],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
