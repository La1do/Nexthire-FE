import { AiSparkIcon, RefreshIcon } from '../../../assets/icons/admin'
import type { AdminAiManagementTranslations } from '../../../i18n/types'

type SystemStatus = 'healthy' | 'degraded' | 'unknown'

type Props = {
  content: AdminAiManagementTranslations
  isRefreshing: boolean
  onRefresh: () => void
  status: SystemStatus
}

export function AdminAiPageHeader({ content, isRefreshing, onRefresh, status }: Props) {
  return <header className="admin-ai-hero">
    <div className="admin-ai-hero__identity">
      <span className="admin-ai-hero__icon"><AiSparkIcon /></span>
      <div><h1>{content.header.title}</h1><p>{content.pageSubtitle}</p></div>
    </div>
    <div className="admin-ai-hero__actions">
      <span className={`admin-ai-health admin-ai-health--${status}`}><i />{content.header[status]}</span>
      <button className="admin-ai-refresh-button" disabled={isRefreshing} onClick={onRefresh} type="button"><RefreshIcon /><span>{isRefreshing ? content.header.refreshing : content.header.refresh}</span></button>
    </div>
  </header>
}
