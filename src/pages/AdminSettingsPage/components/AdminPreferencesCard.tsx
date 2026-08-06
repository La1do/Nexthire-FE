import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../context'
import { getTranslations, isLocale, supportedLocales, useLocale } from '../../../i18n'
import type { AdminSettingsTranslations, CommonTranslations, Locale } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import type { AuthProfile, UpdateAuthProfilePayload } from '../../../services/auth.service'
import { Button, SelectField } from '../../_components'

type Props = {
  content: AdminSettingsTranslations['preferences']
  isPending: boolean
  onLogout: () => void
  onSaveLanguage: (payload: UpdateAuthProfilePayload) => Promise<AuthProfile>
  profile: AuthProfile
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
  messages: AdminSettingsTranslations['preferences'],
  apiErrors: CommonTranslations['apiErrors'],
) {
  if (!status) {
    return null
  }

  if (status.tone === 'success') {
    return messages.languageSaveSuccess
  }

  if (status.code) {
    return apiErrors.byCode[status.code] ?? status.fallbackMessage
  }

  return status.fallbackMessage
}

export function AdminPreferencesCard({ content, isPending, onLogout, onSaveLanguage, profile }: Props) {
  const { locale, syncLocale, translations } = useLocale()
  const toast = useToast()
  const accountLocale = isLocale(profile.language) ? profile.language : locale
  const [savedLocale, setSavedLocale] = useState<Locale>(accountLocale)
  const [selectedLocale, setSelectedLocale] = useState<Locale>(accountLocale)
  const [message, setMessage] = useState<LanguageStatus | null>(null)
  const languageLabels = translations.common.languageSwitcher
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
    setMessage(null)
  }, [accountLocale])

  async function handleSaveLanguage() {
    if (!isDirty) {
      return
    }

    setMessage(null)

    try {
      const updatedProfile = await onSaveLanguage({ language: selectedLocale })
      const nextLocale = isLocale(updatedProfile.language) ? updatedProfile.language : selectedLocale
      setSavedLocale(nextLocale)
      setSelectedLocale(nextLocale)
      syncLocale(nextLocale)
      setMessage({ tone: 'success' })
      toast.success(getTranslations(nextLocale).pages.adminSettings.preferences.languageSaveSuccess)
    } catch (error) {
      const envelope = getApiErrorEnvelope(error)
      const nextMessage = envelope?.error.code
        ? translations.common.apiErrors.byCode[envelope.error.code] ?? envelope.error.message ?? content.languageSaveError
        : envelope?.error.message ?? content.languageSaveError
      setMessage({ tone: 'error', code: envelope?.error.code, fallbackMessage: nextMessage })
      toast.error(nextMessage)
    }
  }

  return <section className="admin-settings-card admin-settings-preferences">
    <header><h2>{content.title}</h2><p>{content.description}</p></header>
    <div className="admin-settings-preference-row admin-settings-preference-row--language">
      <div><strong>{content.language}</strong><p>{content.languageHint}</p></div>
      <div className="admin-settings-language-control">
        <SelectField
          disabled={isPending}
          hideLabel
          label={content.language}
          onChange={(value) => setSelectedLocale(value as Locale)}
          options={options}
          value={selectedLocale}
        />
        {message ? <p className="admin-settings-language-status" data-tone={message.tone}>{resolveLanguageStatusMessage(message, content, translations.common.apiErrors)}</p> : null}
        <div className="admin-settings-language-actions">
          <Button disabled={!isDirty || isPending} onClick={() => void handleSaveLanguage()} type="button">{isPending ? content.languageSaving : content.languageSave}</Button>
          <Button disabled={!isDirty || isPending} onClick={() => { setSelectedLocale(savedLocale); setMessage(null) }} type="button" variant="secondary">{content.languageReset}</Button>
        </div>
      </div>
    </div>
    <div className="admin-settings-preference-row admin-settings-preference-row--danger"><div><strong>{content.sessionTitle}</strong><p>{content.sessionDescription}</p></div><Button onClick={onLogout} variant="secondary">{content.logout}</Button></div>
  </section>
}
