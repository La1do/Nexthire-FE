import { Link } from 'react-router-dom'
import { ApproveIcon, RejectIcon, ViewIcon } from '../../../assets/icons/admin'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { AdminCompany } from '../../../types/admin.types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'

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
      <td><div className="admin-company-table__actions"><Link className="admin-company-action admin-company-action--ghost" to={`/admin/companies/${company.id}`}><ViewIcon /><span>{actions.viewDetail}</span></Link>{company.status === 'PENDING' ? <><button aria-label={actions.approve} className="admin-company-action admin-company-action--approve admin-action--compactable" onClick={() => handlers.onApprove(company)} title={actions.approve} type="button"><ApproveIcon /><span>{actions.approve}</span></button><button aria-label={actions.reject} className="admin-company-action admin-company-action--reject admin-action--compactable" onClick={() => handlers.onReject(company)} title={actions.reject} type="button"><RejectIcon /><span>{actions.reject}</span></button></> : null}</div></td>
    </tr>)}</tbody>
  </table></div>
}
