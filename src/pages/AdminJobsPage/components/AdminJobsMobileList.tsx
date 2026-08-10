import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow, PendingAdminJobAction } from '../types'
import { AdminJobActions } from './AdminJobActions'
import { AdminJobStatusBadge } from './AdminJobStatusBadge'

type Props = {
  content: AdminJobsTranslations
  items: AdminJobRow[]
  onAction: (action: PendingAdminJobAction['action'], item: AdminJobRow, revision: boolean) => void
  onView: (item: AdminJobRow) => void
}

export function AdminJobsMobileList({ content, items, onAction, onView }: Props) {
  return <ul className="admin-jobs-mobile-list">{items.map((item) => <li className="admin-job-card" key={item.id}><header><div><h3>{item.title}</h3><p>{item.companyName ?? content.detail.noData} · {item.location}</p></div><AdminJobStatusBadge labels={content.statuses} status={item.status} /></header><div className="admin-job-card__meta"><span>{content.columns.risk}: <strong>{content.risks[item.moderation.riskLevel ?? 'NONE']}</strong></span><span>{content.columns.applications}: <strong>{item.applicationCount}</strong></span></div><div className="admin-job-card__skills">{item.skills.slice(0, 4).map((skill) => <i key={skill}>{skill}</i>)}</div><AdminJobActions actions={content.actions} item={item} onAction={onAction} onView={onView} /></li>)}</ul>
}
