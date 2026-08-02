import type { AdminAiManagementTranslations } from '../../../i18n/types'

export type AdminAiTab = 'overview' | 'config' | 'logs'

type Props = { activeTab: AdminAiTab; content: AdminAiManagementTranslations['tabs']; onChange: (tab: AdminAiTab) => void }

export function AdminAiTabs({ activeTab, content, onChange }: Props) {
  const tabs: AdminAiTab[] = ['overview', 'config', 'logs']
  return <nav aria-label={content.overview} className="admin-ai-tabs">{tabs.map((tab) => <button aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => onChange(tab)} type="button">{content[tab]}</button>)}</nav>
}
