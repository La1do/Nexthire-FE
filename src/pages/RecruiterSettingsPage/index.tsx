import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context'
import { useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { authService } from '../../services/auth.service'
import type { AuthProfile } from '../../services/auth.service'
import { AccountSettingsForm } from './components/AccountSettingsForm'
import { LanguageSettingsSection } from './components/LanguageSettingsSection'
import { SecuritySettingsForm } from './components/SecuritySettingsForm'
import { SettingsSectionNav } from './components/SettingsSectionNav'
import './recruiter-settings.css'

export function RecruiterSettingsPage() {
  const { pages } = useTranslations()
  const content = pages.recruiterSettings
  const { refreshUser, user } = useAuth()
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const sections = useMemo(
    () => [
      { id: 'settings-account', label: content.navigation.account },
      { id: 'settings-language', label: content.navigation.language },
      { id: 'settings-security', label: content.navigation.security },
    ],
    [content.navigation],
  )

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      setProfile(await authService.getMe())
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.account.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.account.errorDescription])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  return (
    <div className="recruiter-settings-page">
      <SettingsSectionNav label={content.navigation.label} sections={sections} />

      <div className="recruiter-settings-stack">
        <AccountSettingsForm
          companyName={user?.companyName}
          error={loadError}
          loading={loading}
          onRetry={() => void loadProfile()}
          onSaved={(updatedProfile) => {
            setProfile(updatedProfile)
            refreshUser()
          }}
          profile={profile}
          translations={content.account}
        />
        <LanguageSettingsSection translations={content.language} />
        <SecuritySettingsForm translations={content.security} />
      </div>
    </div>
  )
}
