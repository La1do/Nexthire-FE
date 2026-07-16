import type { AdminCompaniesTranslations } from '../../../i18n/types'
import { CompanyStatusBadge } from '../../_components/admin/CompanyStatusBadge'
import type { AdminCompany } from '../types'

type CompanyReviewTableHandlers = {
  onApprove: (company: AdminCompany) => void
  onReject: (company: AdminCompany) => void
}

type CompanyReviewTableProps = {
  actions: AdminCompaniesTranslations['results']['actions']
  columns: AdminCompaniesTranslations['results']['columns']
  companies: ReadonlyArray<AdminCompany>
  handlers: CompanyReviewTableHandlers
  statusesLabel: AdminCompaniesTranslations['statuses']
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function CompanyReviewTable({
  actions,
  columns,
  companies,
  handlers,
  statusesLabel,
}: CompanyReviewTableProps) {
  return (
    <div className="admin-users-table-wrap admin-company-table-wrap">
      <table className="admin-users-table admin-company-table">
        <caption className="sr-only">{columns.company}</caption>
        <thead>
          <tr>
            <th scope="col">{columns.company}</th>
            <th scope="col">{columns.submittedAt}</th>
            <th scope="col">{columns.status}</th>
            <th scope="col" className="admin-users-table__actions-col">{columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>
                <div className="admin-company-cell">
                  <span aria-hidden="true" className="admin-company-cell__logo">{company.logoText}</span>
                  <div>
                    <p className="admin-company-cell__name">{company.name}</p>
                    <a className="admin-company-cell__website" href={company.website} rel="noreferrer" target="_blank">
                      {company.website}
                    </a>
                  </div>
                </div>
              </td>
              <td className="admin-users-table__meta">{company.submittedAt}</td>
              <td>
                <CompanyStatusBadge labels={statusesLabel} status={company.status} />
              </td>
              <td className="admin-company-table__actions">
                <a className="admin-company-action admin-company-action--ghost" href={`/admin/companies/${company.id}`}>
                  {actions.viewDetail}
                </a>
                {company.status === 'approved' ? (
                  <span className="admin-company-action admin-company-action--verified">
                    <CheckIcon />
                    {actions.verified}
                  </span>
                ) : null}
                {company.status === 'pending' ? (
                  <>
                    <button
                      className="admin-company-action admin-company-action--approve"
                      onClick={() => handlers.onApprove(company)}
                      type="button"
                    >
                      <CheckIcon />
                      {actions.approve}
                    </button>
                    <button
                      className="admin-company-action admin-company-action--reject"
                      onClick={() => handlers.onReject(company)}
                      type="button"
                    >
                      <XIcon />
                      {actions.reject}
                    </button>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
