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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

export function AdminJobsTable({ content, items, onAction, onView }: Props) {
  return (
    <div className="admin-users-table-wrap admin-jobs-table-wrap">
      <table className="admin-users-table admin-jobs-table">
        <caption className="sr-only">{content.pageTitle}</caption>
        <colgroup><col className="admin-job-col--job" /><col className="admin-job-col--company" /><col className="admin-job-col--status" /><col className="admin-job-col--risk" /><col className="admin-job-col--applications" /><col className="admin-job-col--updated" /><col className="admin-job-col--actions" /></colgroup>
        <thead><tr><th>{content.columns.job}</th><th>{content.columns.company}</th><th>{content.columns.status}</th><th>{content.columns.risk}</th><th>{content.columns.applications}</th><th>{content.columns.updated}</th><th className="admin-jobs-table__actions-heading">{content.columns.actions}</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id}>
            <td><div className="admin-job-title-cell"><strong>{item.title}</strong><span>{item.location}</span><div>{item.skills.slice(0, 3).map((skill) => <i key={skill}>{skill}</i>)}</div></div></td>
            <td><span className="admin-job-company">{item.companyName ?? content.detail.noData}</span></td>
            <td><AdminJobStatusBadge labels={content.statuses} status={item.status} /></td>
            <td><span className={`admin-job-risk admin-job-risk--${(item.moderation.riskLevel ?? 'NONE').toLowerCase()}`}>{content.risks[item.moderation.riskLevel ?? 'NONE']}</span></td>
            <td className="admin-users-table__meta">{item.applicationCount}</td>
            <td className="admin-users-table__meta">{formatDate(item.updatedAt)}</td>
            <td><AdminJobActions actions={content.actions} item={item} onAction={onAction} onView={onView} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
