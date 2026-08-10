import { ApproveIcon, RejectIcon, ViewIcon } from '../../../assets/icons/admin'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { AdminCompany } from '../../../types/admin.types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'
import { AdminActionMenu } from '../../_components/admin/AdminActionMenu'

type Handlers = { onApprove: (company: AdminCompany) => void; onReject: (company: AdminCompany) => void }
type Props = { actions: AdminCompaniesTranslations['results']['actions']; columns: AdminCompaniesTranslations['results']['columns']; companies: ReadonlyArray<AdminCompany>; handlers: Handlers; statusesLabel: AdminCompaniesTranslations['statuses']; trustLevelsLabel: AdminCompaniesTranslations['trustLevels'] }
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat().format(new Date(value)) : '—' }

export function CompanyReviewTable({ actions, columns, companies, handlers, statusesLabel, trustLevelsLabel }: Props) {
  return <div className="admin-users-table-wrap admin-company-table-wrap"><table className="admin-users-table admin-company-table">
    <caption className="sr-only">{columns.company}</caption>
    <colgroup><col className="admin-company-col--company" /><col className="admin-company-col--date" /><col className="admin-company-col--status" /><col className="admin-company-col--trust" /><col className="admin-company-col--actions" /></colgroup>
    <thead><tr><th>{columns.company}</th><th>{columns.submittedAt}</th><th>{columns.status}</th><th>{columns.trustLevel}</th><th className="admin-company-table__actions-heading">{columns.actions}</th></tr></thead>
    <tbody>{companies.map((company) => <tr key={company.id}>
      <td><div className="admin-company-cell">{company.logoUrl || company.logo ? <img alt="" className="admin-company-cell__logo admin-company-cell__logo--image" src={company.logoUrl ?? company.logo} /> : <span aria-hidden="true" className="admin-company-cell__logo">{initials(company.name)}</span>}<div><p className="admin-company-cell__name">{company.name}</p><p className="admin-company-cell__website">{company.taxCode}</p>{company.verificationRejectedCount > 0 ? <span className="admin-company-review-count">{actions.reviewAgain.replace('{{count}}', String(company.verificationRejectedCount))}</span> : null}</div></div></td>
      <td className="admin-users-table__meta">{formatDate(company.submittedAt ?? company.createdAt)}</td>
      <td><CompanyStatusBadge labels={statusesLabel} status={company.status} />{company.lastVerificationRejectedReason ? <p className="admin-company-last-reason" title={company.lastVerificationRejectedReason}>{company.lastVerificationRejectedReason}</p> : null}</td>
      <td><span className={`admin-company-trust admin-company-trust--${company.trustLevel.toLowerCase()}`}>{trustLevelsLabel[company.trustLevel.toLowerCase() as 'low' | 'medium' | 'high']}</span></td>
      <td><div className="admin-company-table__actions"><AdminActionMenu label={`${columns.actions}: ${company.name}`} items={[{ icon: <ViewIcon />, label: actions.viewDetail, to: `/admin/companies/${company.id}` }, ...(company.status === 'PENDING' ? [{ icon: <ApproveIcon />, label: actions.approve, onClick: () => handlers.onApprove(company), tone: 'success' as const }, { icon: <RejectIcon />, label: actions.reject, onClick: () => handlers.onReject(company), tone: 'danger' as const }] : [])]} /></div></td>
    </tr>)}</tbody>
  </table></div>
}
