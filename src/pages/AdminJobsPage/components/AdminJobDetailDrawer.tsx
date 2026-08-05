import { useEffect, useRef } from 'react'
import { BriefcaseBusiness, Building2, CircleAlert, ClipboardList, MapPin, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow } from '../types'
import { isAdminJobRevision } from '../types'
import { AdminJobStatusBadge } from './AdminJobStatusBadge'

type Props = { content: AdminJobsTranslations; item: AdminJobRow | null; onClose: () => void }

function renderTextSection(title: string, value: string | null | undefined, emptyLabel: string) {
  return <section className="admin-job-drawer__content-section"><h3>{title}</h3><p className={value ? undefined : 'is-empty'}>{value || emptyLabel}</p></section>
}

function getRuleLabel(rule: string, labels: Record<string, string>) {
  return labels[rule] ?? rule.replaceAll('_', ' ')
}

function getReasonLabel(reason: string, labels: Record<string, string>) {
  return labels[reason] ?? reason
}

export function AdminJobDetailDrawer({ content, item, onClose }: Props) {
  const drawerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!item) return
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    drawerRef.current?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) { event.preventDefault(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', close)
    return () => { window.removeEventListener('keydown', close); triggerRef.current?.focus() }
  }, [item, onClose])
  if (!item) return null

  const riskKey = item.moderation.riskLevel ?? 'NONE'
  const riskScore = Math.min(100, Math.max(0, item.moderation.riskScore ?? 0))
  return (
    <div className="admin-job-drawer-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <aside aria-label={content.detail.title} aria-modal="true" className="admin-job-drawer" ref={drawerRef} role="dialog" tabIndex={-1}>
        <header className="admin-job-drawer__hero"><div className="admin-job-drawer__hero-icon" aria-hidden="true"><BriefcaseBusiness /></div><div className="admin-job-drawer__hero-content"><span>{content.detail.title}</span><h2>{item.title}</h2><div className="admin-job-drawer__meta"><span><Building2 />{item.companyName ?? content.detail.noData}</span><span><MapPin />{item.location}</span></div><div className="admin-job-drawer__badges"><AdminJobStatusBadge labels={content.statuses} status={item.status} /><span className={`admin-job-risk admin-job-risk--${riskKey.toLowerCase()}`}>{content.risks[riskKey]}</span></div></div><button aria-label={content.detail.close} onClick={onClose} type="button"><X /></button></header>
        <div className="admin-job-drawer__body">
          {isAdminJobRevision(item) ? <section className="admin-job-drawer__revision"><span aria-hidden="true"><ClipboardList /></span><div><h3>{content.detail.changeSummary}</h3><p>{item.changeSummary || content.detail.noData}</p></div></section> : null}
          <section className="admin-job-drawer__group"><header><Sparkles /><h3>{content.detail.description}</h3></header>{renderTextSection(content.detail.description, item.description, content.detail.noData)}{renderTextSection(content.detail.requirements, item.requirements, content.detail.noData)}{renderTextSection(content.detail.benefits, item.benefits, content.detail.noData)}<section className="admin-job-drawer__content-section"><h3>{content.detail.skills}</h3>{item.skills.length ? <div className="admin-job-drawer__skills">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="is-empty">{content.detail.noData}</p>}</section></section>
          <section className={`admin-job-moderation admin-job-moderation--${riskKey.toLowerCase()}`}><header><ShieldCheck /><div><h3>{content.detail.moderation}</h3><p>{content.columns.risk}</p></div></header><div className="admin-job-moderation__score"><strong>{riskScore}<small>/100</small></strong><div><span>{content.risks[riskKey]}</span><div aria-label={`${content.columns.risk}: ${riskScore}/100`} className="admin-job-moderation__meter"><i style={{ width: `${riskScore}%` }} /></div></div></div><div className="admin-job-moderation__details"><div><h4><CircleAlert />{content.detail.reasons}</h4>{item.moderation.reasons.length ? <ul>{item.moderation.reasons.map((reason) => <li key={reason}>{getReasonLabel(reason, content.detail.reasonLabels)}</li>)}</ul> : <p className="is-empty">{content.detail.noData}</p>}</div><div><h4><ClipboardList />{content.detail.rules}</h4>{item.moderation.matchedRules.length ? <div className="admin-job-drawer__rules">{item.moderation.matchedRules.map((rule) => <span key={rule}>{getRuleLabel(rule, content.detail.ruleLabels)}</span>)}</div> : <p className="is-empty">{content.detail.noData}</p>}</div></div></section>
        </div>
      </aside>
    </div>
  )
}
