import { flushSync } from 'react-dom'
import { supportedLocales, useLocale } from '../../i18n'
import type { Locale } from '../../i18n'
import { SelectField } from './SelectField'

type LanguageSwitchProps = {
  className?: string
  compact?: boolean
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => void
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function LanguageSwitch({ className = '', compact = false }: LanguageSwitchProps) {
  const { locale, setLocale, translations } = useLocale()
  const labels = translations.common.languageSwitcher
  const options = supportedLocales.map((option) => ({
    label: compact ? labels.shortOptions[option] : labels.options[option],
    value: option,
  }))

  const handleChange = (value: string) => {
    const nextLocale = value as Locale

    if (nextLocale === locale) {
      return
    }

    const transitionDocument = document as ViewTransitionDocument

    if (!transitionDocument.startViewTransition || prefersReducedMotion()) {
      setLocale(nextLocale)
      return
    }

    transitionDocument.startViewTransition(() => {
      flushSync(() => setLocale(nextLocale))
    })
  }

  return (
    <SelectField
      className={`language-switch ${className}`.trim()}
      compact={compact}
      hideLabel
      label={labels.label}
      onChange={handleChange}
      options={options}
      value={locale}
    />
  )
}
