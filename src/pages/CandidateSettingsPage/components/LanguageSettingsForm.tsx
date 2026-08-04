import { useEffect, useMemo, useState } from 'react'
import { useAuth, useToast } from '../../../context'
import { isLocale, supportedLocales, useLocale } from '../../../i18n'
import type { CandidateSettingsTranslations, Locale } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { candidateService } from '../../../services/candidate.service'
import { Button, SelectField } from '../../_components'

type LanguageSettingsFormProps = {
  translations: CandidateSettingsTranslations['language']
}

export function LanguageSettingsForm({ translations }: LanguageSettingsFormProps) {
  const { refreshUser, user } = useAuth()
  const { locale, setLocale, translations: allTranslations } = useLocale()
  const toast = useToast()
  const accountLocale = isLocale(user?.language) ? user.language : locale
  const [savedLocale, setSavedLocale] = useState<Locale>(accountLocale)
  const [selectedLocale, setSelectedLocale] = useState<Locale>(accountLocale)
  const [isSaving, setSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const languageLabels = allTranslations.common.languageSwitcher
  const options = useMemo(
    () => supportedLocales.map((option) => ({
      label: languageLabels.options[option],
      value: option,
    })),
    [languageLabels.options],
  )
  const isDirty = selectedLocale !== savedLocale

  useEffect(() => {
    setSavedLocale(accountLocale)
    setSelectedLocale(accountLocale)
    setSubmitMessage(null)
  }, [accountLocale])

  async function handleSave() {
    if (!isDirty) {
      return
    }

    setSaving(true)
    setSubmitMessage(null)

    try {
      await candidateService.updateMyProfile({
        profile: {
          language: selectedLocale,
        },
      })
      setSavedLocale(selectedLocale)
      setLocale(selectedLocale)
      refreshUser()
      setSubmitMessage({ tone: 'success', text: translations.saveSuccess })
      toast.success(translations.saveSuccess)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? translations.saveError
      setSubmitMessage({ tone: 'error', text: message })
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      aria-labelledby="candidate-settings-language-title"
      className="candidate-settings-section candidate-settings-section--language"
    >
      <header className="candidate-settings-section__header">
        <h2 id="candidate-settings-language-title">{translations.title}</h2>
        <p>{translations.description}</p>
      </header>

      <div className="candidate-settings-form">
        <div className="candidate-settings-form__fields">
          <div className="candidate-settings-field candidate-settings-language-control">
            <SelectField
              className="candidate-settings-language-switch"
              disabled={isSaving}
              hideLabel
              id="candidate-settings-language"
              label={translations.controlLabel}
              onChange={(value) => setSelectedLocale(value as Locale)}
              options={options}
              value={selectedLocale}
            />
            <small>{translations.helper}</small>
          </div>
        </div>

        {submitMessage ? (
          <p
            className="candidate-settings-status"
            data-tone={submitMessage.tone}
            role={submitMessage.tone === 'error' ? 'alert' : 'status'}
          >
            {submitMessage.text}
          </p>
        ) : null}

        <div className="candidate-settings-actions">
          <Button
            aria-busy={isSaving}
            className="candidate-settings-submit"
            disabled={!isDirty || isSaving}
            onClick={() => void handleSave()}
            type="button"
          >
            {isSaving ? <span aria-hidden="true" className="candidate-settings-spinner" /> : null}
            <span>{isSaving ? translations.saveLoading : translations.save}</span>
          </Button>
          <Button
            disabled={!isDirty || isSaving}
            onClick={() => {
              setSelectedLocale(savedLocale)
              setSubmitMessage(null)
            }}
            type="button"
            variant="secondary"
          >
            {translations.reset}
          </Button>
        </div>
      </div>
    </section>
  )
}
