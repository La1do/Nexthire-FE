import type { ChangeEvent } from 'react'
import { supportedLocales, useLocale } from '../../i18n'
import type { Locale } from '../../i18n'

type LanguageSwitchProps = {
  className?: string
  compact?: boolean
}

export function LanguageSwitch({ className = '', compact = false }: LanguageSwitchProps) {
  const { locale, setLocale, translations } = useLocale()
  const labels = translations.common.languageSwitcher

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale)
  }

  return (
    <label className={`language-switch ${compact ? 'language-switch--compact' : ''} ${className}`.trim()}>
      <span className="sr-only">{labels.label}</span>
      <select
        aria-label={labels.label}
        className="language-switch__select"
        onChange={handleChange}
        value={locale}
      >
        {supportedLocales.map((option) => (
          <option key={option} value={option}>
            {compact ? labels.shortOptions[option] : labels.options[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
