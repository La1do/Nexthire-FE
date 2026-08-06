import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context'
import { getTranslations, isLocale, supportedLocales, useLocale } from '../../../i18n'
import type { CommonTranslations, Locale, RecruiterSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { authService } from '../../../services/auth.service'
import type { AuthProfile } from '../../../services/auth.service'
import { Button, SelectField } from '../../_components'

type LanguageSettingsSectionProps = {
  loading: boolean
  onSaved: (profile: AuthProfile) => void
  profile: AuthProfile | null
  translations: RecruiterSettingsTranslations['language']
}

type LanguageStatus =
  | {
      tone: 'success'
    }
  | {
      tone: 'error'
      code?: string
      fallbackMessage: string
    }

function resolveLanguageStatusMessage(
  status: LanguageStatus | null,
  messages: RecruiterSettingsTranslations['language'],
  apiErrors: CommonTranslations['apiErrors'],
) {
  if (!status) {
    return null
  }

  if (status.tone === 'success') {
    return messages.saveSuccess
  }

  if (status.code) {
    return apiErrors.byCode[status.code] ?? status.fallbackMessage
  }

  return status.fallbackMessage
}

export function LanguageSettingsSection({
  loading,
  onSaved,
  profile,
  translations,
}: LanguageSettingsSectionProps) {
  const { locale, syncLocale, translations: allTranslations } = useLocale()
  const toast = useToast()
  const accountLocale = isLocale(profile?.language) ? profile.language : locale
  const [savedLocale, setSavedLocale] = useState<Locale>(accountLocale)
  const [selectedLocale, setSelectedLocale] = useState<Locale>(accountLocale)
  const [isSaving, setSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<LanguageStatus | null>(null)
  const languageLabels = allTranslations.common.languageSwitcher
  const options = useMemo(
    () => supportedLocales.map((option) => ({
      label: languageLabels.options[option],
      value: option,
    })),
    [languageLabels.options],
  )
  const isDirty = selectedLocale !== savedLocale
  const isDisabled = loading || isSaving || !profile

  useEffect(() => {
    setSavedLocale(accountLocale)
    setSelectedLocale(accountLocale)
    setSubmitMessage(null)
  }, [accountLocale])

  async function handleSave() {
    if (!profile || !isDirty) {
      return
    }

    setSaving(true)
    setSubmitMessage(null)

    try {
      const updatedProfile = await authService.updateMe({
        language: selectedLocale,
      })
      const nextLocale = isLocale(updatedProfile.language) ? updatedProfile.language : selectedLocale
      setSavedLocale(nextLocale)
      setSelectedLocale(nextLocale)
      syncLocale(nextLocale)
      onSaved(updatedProfile)
      setSubmitMessage({ tone: 'success' })
      toast.success(getTranslations(nextLocale).pages.recruiterSettings.language.saveSuccess)
    } catch (error) {
      const envelope = getApiErrorEnvelope(error)
      const message = envelope?.error.code
        ? allTranslations.common.apiErrors.byCode[envelope.error.code] ?? envelope.error.message ?? translations.saveError
        : envelope?.error.message ?? translations.saveError
      setSubmitMessage({ tone: 'error', code: envelope?.error.code, fallbackMessage: message })
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="settings-language-title" className="recruiter-settings-section" id="settings-language">
      <header className="recruiter-settings-section__header">
        <h2 id="settings-language-title">{translations.title}</h2>
        <p>{translations.description}</p>
      </header>

      <div className="recruiter-settings-language-control">
        <SelectField
          className="recruiter-settings-language-switch"
          disabled={isDisabled}
          hideLabel
          id="settings-language-select"
          label={translations.controlLabel}
          onChange={(value) => setSelectedLocale(value as Locale)}
          options={options}
          value={selectedLocale}
        />
        <small>{translations.helper}</small>

        {submitMessage ? (
          <p
            className="recruiter-settings-status"
            data-tone={submitMessage.tone}
            role={submitMessage.tone === 'error' ? 'alert' : 'status'}
          >
            {resolveLanguageStatusMessage(submitMessage, translations, allTranslations.common.apiErrors)}
          </p>
        ) : null}

        <div className="recruiter-settings-actions">
          <Button disabled={!isDirty || isDisabled} onClick={() => void handleSave()} type="button">
            {isSaving ? translations.saveLoading : translations.save}
          </Button>
          <Button
            disabled={!isDirty || isDisabled}
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
