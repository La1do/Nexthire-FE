import { useTranslations } from '../../i18n'
import { PasswordSettingsForm } from './components/PasswordSettingsForm'
import './candidate-settings.css'

export function CandidateSettingsPage() {
  const translations = useTranslations().pages.candidateSettings

  return (
    <div className="candidate-settings-page">
      <header className="candidate-settings-intro">
        <p>{translations.pageSubtitle}</p>
      </header>

      <PasswordSettingsForm translations={translations.security} />
    </div>
  )
}
