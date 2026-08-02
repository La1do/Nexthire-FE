import { useEffect } from 'react'
import { DismissIcon } from '../../../assets/icons/admin'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow } from '../types'
import { isAdminJobRevision } from '../types'
import { AdminJobStatusBadge } from './AdminJobStatusBadge'

type Props = { content: AdminJobsTranslations; item: AdminJobRow | null; onClose: () => void }

function renderTextSection(title: string, value: string | null | undefined, emptyLabel: string) {
  return <section><h3>{title}</h3><p>{value || emptyLabel}</p></section>
}

export function AdminJobDetailDrawer({ content, item, onClose }: Props) {
  useEffect(() => {
    if (!item) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [item, onClose])
  if (!item) return null

  const riskKey = item.moderation.riskLevel ?? 'NONE'
  return (
    <div className="admin-job-drawer-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <aside aria-label={content.detail.title} aria-modal="true" className="admin-job-drawer" role="dialog">
        <header><div><span>{content.detail.title}</span><h2>{item.title}</h2><p>{item.companyName ?? content.detail.noData} · {item.location}</p></div><button aria-label={content.detail.close} onClick={onClose} type="button"><DismissIcon /></button></header>
        <div className="admin-job-drawer__badges"><AdminJobStatusBadge labels={content.statuses} status={item.status} /><span className={`admin-job-risk admin-job-risk--${riskKey.toLowerCase()}`}>{content.risks[riskKey]}</span></div>
        <div className="admin-job-drawer__body">
          {isAdminJobRevision(item) ? renderTextSection(content.detail.changeSummary, item.changeSummary, content.detail.noData) : null}
          {renderTextSection(content.detail.description, item.description, content.detail.noData)}
          {renderTextSection(content.detail.requirements, item.requirements, content.detail.noData)}
          {renderTextSection(content.detail.benefits, item.benefits, content.detail.noData)}
          <section><h3>{content.detail.skills}</h3><div className="admin-job-drawer__skills">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
          <section className="admin-job-moderation"><h3>{content.detail.moderation}</h3><strong>{item.moderation.riskScore ?? 0}/100 · {content.risks[riskKey]}</strong><h4>{content.detail.reasons}</h4>{item.moderation.reasons.length ? <ul>{item.moderation.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul> : <p>{content.detail.noData}</p>}<h4>{content.detail.rules}</h4>{item.moderation.matchedRules.length ? <div className="admin-job-drawer__rules">{item.moderation.matchedRules.map((rule) => <code key={rule}>{rule}</code>)}</div> : <p>{content.detail.noData}</p>}</section>
        </div>
      </aside>
    </div>
  )
}
