import type { AdminSettingsTranslations } from '../../../i18n/types'
import { Button, LanguageSwitch } from '../../_components'

type Props = { content: AdminSettingsTranslations['preferences']; onLogout: () => void }

export function AdminPreferencesCard({ content, onLogout }: Props) {
  return <section className="admin-settings-card admin-settings-preferences">
    <header><h2>{content.title}</h2><p>{content.description}</p></header>
    <div className="admin-settings-preference-row"><div><strong>{content.language}</strong><p>{content.languageHint}</p></div><LanguageSwitch /></div>
    <div className="admin-settings-preference-row admin-settings-preference-row--danger"><div><strong>{content.sessionTitle}</strong><p>{content.sessionDescription}</p></div><Button onClick={onLogout} variant="secondary">{content.logout}</Button></div>
  </section>
}
