import type { RecruiterSettingsTranslations } from '../../../i18n/types'
import { LanguageSwitch } from '../../_components'

type LanguageSettingsSectionProps = {
  translations: RecruiterSettingsTranslations['language']
}

export function LanguageSettingsSection({ translations }: LanguageSettingsSectionProps) {
  return (
    <section aria-labelledby="settings-language-title" className="recruiter-settings-section" id="settings-language">
      <header className="recruiter-settings-section__header">
        <h2 id="settings-language-title">{translations.title}</h2>
        <p>{translations.description}</p>
      </header>

      <div className="recruiter-settings-language-control">
        <span>{translations.controlLabel}</span>
        <LanguageSwitch className="recruiter-settings-language-switch" />
        <small>{translations.helper}</small>
      </div>
    </section>
  )
}
