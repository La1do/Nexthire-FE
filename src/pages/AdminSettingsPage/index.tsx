import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { useTranslations } from '../../i18n'
import { ConfirmModal, ErrorState, LoadingSkeleton } from '../_components'
import { AdminAccountSummary } from './components/AdminAccountSummary'
import { AdminChangePasswordForm } from './components/AdminChangePasswordForm'
import { AdminPreferencesCard } from './components/AdminPreferencesCard'
import { AdminProfileForm } from './components/AdminProfileForm'
import { useAdminSettings } from './hooks/useAdminSettings'

export function AdminSettingsPage() {
  const { pages } = useTranslations()
  const content = pages.adminSettings
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { changePassword, deleteAvatar, profileQuery, updateAvatar, updateProfile } = useAdminSettings()

  if (profileQuery.isLoading) return <LoadingSkeleton ariaLabel={content.feedback.loading} lines={5} />
  if (profileQuery.isError || !profileQuery.data) return <ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void profileQuery.refetch()} title={content.feedback.errorTitle} />

  return <div className="admin-settings-page">
    <header className="admin-settings-page__intro"><p>{content.pageSubtitle}</p></header>
    <div className="admin-settings-layout">
      <aside className="admin-settings-layout__aside">
        <AdminAccountSummary content={content.summary} isPending={updateAvatar.isPending || deleteAvatar.isPending} onDelete={deleteAvatar.mutateAsync} onUpload={updateAvatar.mutateAsync} profile={profileQuery.data} />
        <AdminPreferencesCard
          content={content.preferences}
          isPending={updateProfile.isPending}
          onLogout={() => setLogoutOpen(true)}
          onSaveLanguage={updateProfile.mutateAsync}
          profile={profileQuery.data}
        />
      </aside>
      <div className="admin-settings-layout__main">
        <AdminProfileForm content={content.profile} isPending={updateProfile.isPending} onSave={updateProfile.mutateAsync} profile={profileQuery.data} />
        <AdminChangePasswordForm content={content.password} isPending={changePassword.isPending} onSave={changePassword.mutateAsync} />
      </div>
    </div>
    <ConfirmModal cancelLabel={content.logout.cancel} confirmLabel={content.logout.confirm} description={content.logout.description} isOpen={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={() => void logout().then(() => navigate('/admin/login'))} title={content.logout.title} />
  </div>
}
