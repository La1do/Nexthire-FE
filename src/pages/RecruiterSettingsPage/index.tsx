import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context'
import { useTranslations } from '../../i18n'
import { getApiErrorCode, getApiErrorEnvelope } from '../../lib/api/apiError'
import { authService } from '../../services/auth.service'
import type { AuthProfile } from '../../services/auth.service'
import { companyService } from '../../services/company.service'
import type { CompanyResponse } from '../../types/company.types'
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
  const [company, setCompany] = useState<CompanyResponse | null>(null)
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
      const [nextProfile, nextCompany] = await Promise.all([
        authService.getMe(),
        companyService.getMyCompany().catch((error: unknown) => {
          if (getApiErrorCode(error) === 'COMPANY.NOT_FOUND') return null
          throw error
        }),
      ])
      setProfile(nextProfile)
      setCompany(nextCompany)
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
          company={company}
          companyName={company?.name ?? user?.companyName}
          error={loadError}
          loading={loading}
          onRetry={() => void loadProfile()}
          onSaved={(updatedProfile, updatedCompany) => {
            setProfile(updatedProfile)
            setCompany(updatedCompany)
            refreshUser()
          }}
          profile={profile}
          translations={content.account}
        />
        <LanguageSettingsSection
          loading={loading}
          onSaved={(updatedProfile) => {
            setProfile(updatedProfile)
            refreshUser()
          }}
          profile={profile}
          translations={content.language}
        />
        <SecuritySettingsForm translations={content.security} />
      </div>
    </div>
  )
}
