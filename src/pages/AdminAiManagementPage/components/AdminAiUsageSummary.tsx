import type { AdminAiManagementTranslations } from '../../../i18n/types'
import type { AdminAiUsageSummary } from '../../../types/admin.types'
import { ErrorState } from '../../_components/admin/ErrorState'
import { LoadingSkeleton } from '../../_components/admin/LoadingSkeleton'

type Props = { content: AdminAiManagementTranslations; data?: AdminAiUsageSummary[]; isError: boolean; isLoading: boolean; onRetry: () => void }
const number = new Intl.NumberFormat()
const cost = (value: string | null, fallback: string) => value == null ? fallback : `$${Number(value).toFixed(4)}`

export function AdminAiUsageSummaryView({ content, data, isError, isLoading, onRetry }: Props) {
  if (isLoading) return <section className="admin-ai-panel"><LoadingSkeleton ariaLabel={content.summary.title} lines={6} /></section>
  if (isError) return <section className="admin-ai-panel"><ErrorState actionLabel={content.summary.retry} description={content.summary.errorDescription} onRetry={onRetry} title={content.summary.errorTitle} /></section>
  const rows = data ?? []
  const totals = rows.reduce((value, row) => ({ requests: value.requests + row.totalRequests, failed: value.failed + row.failedRequests, tokens: value.tokens + row.totalTokens, cost: value.cost + (row.estimatedCostUsd == null ? 0 : Number(row.estimatedCostUsd)), hasCost: value.hasCost || row.estimatedCostUsd != null }), { requests: 0, failed: 0, tokens: 0, cost: 0, hasCost: false })
  return <section className="admin-ai-usage-section">
    <header className="admin-ai-section-heading"><div><h2>{content.summary.title}</h2><p>{content.summary.description}</p></div></header>
    <div className="admin-ai-kpis"><article><span>{content.summary.totalRequests}</span><strong>{number.format(totals.requests)}</strong></article><article><span>{content.summary.failedRequests}</span><strong>{number.format(totals.failed)}</strong></article><article><span>{content.summary.totalTokens}</span><strong>{number.format(totals.tokens)}</strong></article><article><span>{content.summary.estimatedCost}</span><strong>{totals.hasCost ? `$${totals.cost.toFixed(4)}` : content.summary.noPricing}</strong></article></div>
    <div className="admin-ai-panel admin-ai-summary-table-wrap">{rows.length === 0 ? <p className="admin-ai-empty">{content.summary.empty}</p> : <table className="admin-ai-summary-table"><thead><tr><th>{content.summary.columns.provider}</th><th>{content.summary.columns.model}</th><th>{content.summary.columns.requests}</th><th>{content.summary.columns.success}</th><th>{content.summary.columns.failed}</th><th>{content.summary.columns.failureRate}</th><th>{content.summary.columns.inputTokens}</th><th>{content.summary.columns.outputTokens}</th><th>{content.summary.columns.totalTokens}</th><th>{content.summary.columns.cost}</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.provider}-${row.model}`}><td><span className={`admin-ai-provider-pill admin-ai-provider-pill--${row.provider.toLowerCase()}`}>{row.provider}</span></td><td><strong>{row.model}</strong></td><td>{number.format(row.totalRequests)}</td><td className="is-success">{number.format(row.succeededRequests)}</td><td className={row.failedRequests ? 'is-danger' : ''}>{number.format(row.failedRequests)}</td><td>{row.totalRequests ? `${((row.failedRequests / row.totalRequests) * 100).toFixed(1)}%` : '0%'}</td><td>{number.format(row.inputTokens)}</td><td>{number.format(row.outputTokens)}</td><td>{number.format(row.totalTokens)}</td><td>{cost(row.estimatedCostUsd, content.summary.noPricing)}</td></tr>)}</tbody></table>}</div>
    <p className="admin-ai-cost-note">{content.notes.estimatedCost}</p>
  </section>
}
