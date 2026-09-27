import { Link } from 'react-router-dom'
import { useCompanyPlan } from '../../../hooks/useCompanyPlan'
import { useLocale, useTranslations } from '../../../i18n'
import type { CompanyPlan } from '../../../types/company.types'
import { STATIC_SAMPLE_INVOICES } from '../billingStaticData'
import { hasActiveManager } from '../memberRoles'
import { useCompanyMembers } from '../useCompanyWorkspaceQueries'
import { formatCompanyDate, formatCompanyMoney } from '../utils'
import './company-billing.css'

const PLANS: ReadonlyArray<CompanyPlan> = ['FREE', 'PRO']

type CompareRowKey = 'seats' | 'directPublish' | 'approval' | 'assignment' | 'reports' | 'audit'

/** Marketing comparison only (no price). Access itself is always decided by `can()`. */
const COMPARE_ROWS: ReadonlyArray<{ key: CompareRowKey; FREE: boolean; PRO: boolean }> = [
  { FREE: true, key: 'seats', PRO: true },
  { FREE: true, key: 'directPublish', PRO: true },
  { FREE: false, key: 'approval', PRO: true },
  { FREE: false, key: 'assignment', PRO: true },
  { FREE: false, key: 'reports', PRO: true },
  { FREE: false, key: 'audit', PRO: true },
]

const MEMBERS_TAB_HREF = '/recruiter/company?tab=members'

/**
 * Plan comparison, plan change and invoice history. Rendered only when `billing.manage` is allowed.
 * TODO(A1): upgrade / downgrade stay disabled and invoices are sample data until
 * `teamCompanyService.changePlan()` and `listInvoices()` are wired in PR C.
 */
export function CompanyBillingTab() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterCompany.billing
  const plan = useCompanyPlan().data?.plan
  const isPro = plan === 'PRO'
  const membersQuery = useCompanyMembers(isPro)
  const needsManager = isPro && membersQuery.isSuccess && !hasActiveManager(membersQuery.data)

  function renderCompareCell(row: (typeof COMPARE_ROWS)[number], column: CompanyPlan) {
    if (row.key === 'seats') return column === 'FREE' ? content.compare.rows.seatsFree : content.compare.rows.seatsPro
    return row[column] ? content.compare.included : content.compare.notIncluded
  }

  return (
    <div className="company-billing">
      {needsManager ? (
        <section aria-labelledby="company-billing-invite" className="company-billing__invite" role="status">
          <div>
            <h2 id="company-billing-invite">{content.inviteManager.title}</h2>
            <p>{content.inviteManager.description}</p>
          </div>
          <Link className="recruiter-company-action recruiter-company-action--primary" to={MEMBERS_TAB_HREF}>
            {content.inviteManager.action}
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="company-billing-title" className="recruiter-company-panel">
        <div className="recruiter-company-panel__header">
          <h2 id="company-billing-title">{content.title}</h2>
          <p>{content.description}</p>
        </div>

        <ul className="company-billing__plans">
          {PLANS.map((item) => {
            const isCurrent = item === plan
            return (
              <li className={`company-billing__plan ${isCurrent ? 'is-current' : ''}`.trim()} key={item}>
                <div className="company-billing__plan-head">
                  <h3>{content.plans[item].name}</h3>
                  {isCurrent ? <span className="company-billing__badge">{content.currentBadge}</span> : null}
                </div>
                <p>{content.plans[item].summary}</p>
              </li>
            )
          })}
        </ul>

        <div className="company-billing__table-wrap">
          <table className="company-billing__compare">
            <caption className="sr-only">{content.compare.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{content.compare.feature}</th>
                {PLANS.map((item) => (
                  <th key={item} scope="col">
                    {content.plans[item].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{content.compare.rows[row.key]}</th>
                  {PLANS.map((item) => (
                    <td data-included={row.key === 'seats' ? undefined : String(row[item])} key={item}>
                      {renderCompareCell(row, item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="company-billing__actions">
          {/* TODO(A1): wire to teamCompanyService.changePlan() with a ConfirmModal in PR C. */}
          <button
            aria-describedby="company-billing-not-connected"
            className="recruiter-company-action recruiter-company-action--primary"
            disabled
            type="button"
          >
            {isPro ? content.downgrade : content.upgrade}
          </button>
          <p className="company-billing__hint" id="company-billing-not-connected">
            {content.notConnectedNotice}
          </p>
        </div>
      </section>

      <section aria-labelledby="company-invoices-title" className="recruiter-company-panel">
        <div className="recruiter-company-panel__header">
          <h2 id="company-invoices-title">{content.invoices.title}</h2>
          <p>{content.invoices.description}</p>
        </div>
        {/* TODO(A1): sample data until listInvoices() is wired in PR C. */}
        <p className="recruiter-company-feedback is-warning">{content.invoices.sampleNotice}</p>
        {STATIC_SAMPLE_INVOICES.length === 0 ? (
          <p>{content.invoices.empty}</p>
        ) : (
          <table className="company-billing__invoices">
            <caption className="sr-only">{content.invoices.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{content.invoices.number}</th>
                <th scope="col">{content.invoices.period}</th>
                <th scope="col">{content.invoices.amount}</th>
                <th scope="col">{content.invoices.status}</th>
                <th scope="col">{content.invoices.issuedAt}</th>
              </tr>
            </thead>
            <tbody>
              {STATIC_SAMPLE_INVOICES.map((invoice) => (
                <tr key={invoice.id}>
                  <th data-label={content.invoices.number} scope="row">
                    {invoice.number}
                  </th>
                  <td data-label={content.invoices.period}>
                    {formatCompanyDate(invoice.periodStart, locale)} – {formatCompanyDate(invoice.periodEnd, locale)}
                  </td>
                  <td data-label={content.invoices.amount}>{formatCompanyMoney(invoice.amount, invoice.currency, locale)}</td>
                  <td data-label={content.invoices.status}>
                    <span className={`company-billing__invoice-status is-${invoice.status.toLowerCase()}`}>
                      {content.invoices.statuses[invoice.status]}
                    </span>
                  </td>
                  <td data-label={content.invoices.issuedAt}>{formatCompanyDate(invoice.issuedAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
