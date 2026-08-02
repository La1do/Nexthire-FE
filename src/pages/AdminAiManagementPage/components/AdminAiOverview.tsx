import type { CSSProperties } from 'react'
import { AiActivityIcon, AiCostIcon, AiTokenIcon } from '../../../assets/icons/admin'
import type { AdminAiManagementTranslations } from '../../../i18n/types'
import type { AdminAiConfig, AdminAiUsageSummary } from '../../../types/admin.types'
import { LoadingSkeleton } from '../../_components/admin/LoadingSkeleton'
import { AdminAiInlineError } from './AdminAiInlineError'

type Props = { config?: AdminAiConfig; content: AdminAiManagementTranslations; data?: AdminAiUsageSummary[]; isError: boolean; isLoading: boolean; onRetry: () => void }
const number = new Intl.NumberFormat()
const cost = (value: string | null, fallback: string) => value == null ? fallback : `$${Number(value).toFixed(4)}`

export function AdminAiOverview({ config, content, data, isError, isLoading, onRetry }: Props) {
  if (isLoading) return <section className="admin-ai-panel"><LoadingSkeleton ariaLabel={content.summary.title} lines={6} /></section>
  if (isError) return <section className="admin-ai-panel admin-ai-panel--compact"><AdminAiInlineError actionLabel={content.summary.retry} description={content.summary.errorDescription} onRetry={onRetry} title={content.summary.errorTitle} /></section>
  const rows = data ?? []
  const totals = rows.reduce((value, row) => ({ requests: value.requests + row.totalRequests, succeeded: value.succeeded + row.succeededRequests, failed: value.failed + row.failedRequests, tokens: value.tokens + row.totalTokens, cost: value.cost + (row.estimatedCostUsd == null ? 0 : Number(row.estimatedCostUsd)), hasCost: value.hasCost || row.estimatedCostUsd != null }), { requests: 0, succeeded: 0, failed: 0, tokens: 0, cost: 0, hasCost: false })
  const successRate = totals.requests ? (totals.succeeded / totals.requests) * 100 : 0
  const activeProvider = config?.currentConfig.activeProvider
  return <section className="admin-ai-overview">
    <header className="admin-ai-section-heading"><div><h2>{content.summary.title}</h2><p>{content.summary.description}</p></div>{activeProvider && <span className={`admin-ai-provider-pill admin-ai-provider-pill--${activeProvider.toLowerCase()}`}>{activeProvider}</span>}</header>
    <div className="admin-ai-kpis">
      <article><span className="admin-ai-kpi-icon admin-ai-kpi-icon--requests"><AiActivityIcon /></span><div><span>{content.summary.totalRequests}</span><strong>{number.format(totals.requests)}</strong></div></article>
      <article><span className="admin-ai-kpi-icon admin-ai-kpi-icon--success">✓</span><div><span>{content.summary.succeededRequests}</span><strong>{number.format(totals.succeeded)}</strong></div></article>
      <article><span className="admin-ai-kpi-icon admin-ai-kpi-icon--failed">!</span><div><span>{content.summary.failedRequests}</span><strong>{number.format(totals.failed)}</strong></div></article>
      <article><span className="admin-ai-kpi-icon admin-ai-kpi-icon--tokens"><AiTokenIcon /></span><div><span>{content.summary.totalTokens}</span><strong>{number.format(totals.tokens)}</strong></div></article>
    </div>
    <div className="admin-ai-overview__insights">
      <article className="admin-ai-panel admin-ai-success-card"><div className="admin-ai-success-ring" style={{ '--success-rate': `${successRate * 3.6}deg` } as CSSProperties}><strong>{successRate.toFixed(1)}%</strong></div><div><h3>{content.summary.successRate}</h3><p>{number.format(totals.succeeded)} / {number.format(totals.requests)}</p></div></article>
      <article className="admin-ai-panel admin-ai-cost-card"><span><AiCostIcon /></span><div><h3>{content.summary.estimatedCost}</h3><strong>{totals.hasCost ? `$${totals.cost.toFixed(4)}` : content.summary.noPricing}</strong><p>{content.notes.estimatedCost}</p></div></article>
    </div>
    <div className="admin-ai-panel admin-ai-summary-table-wrap"><h3>{content.summary.providerBreakdown}</h3>{rows.length === 0 ? <p className="admin-ai-empty">{content.summary.empty}</p> : <table className="admin-ai-summary-table"><thead><tr><th>{content.summary.columns.provider}</th><th>{content.summary.columns.model}</th><th>{content.summary.columns.requests}</th><th>{content.summary.columns.success}</th><th>{content.summary.columns.failed}</th><th>{content.summary.columns.failureRate}</th><th>{content.summary.columns.inputTokens}</th><th>{content.summary.columns.outputTokens}</th><th>{content.summary.columns.totalTokens}</th><th>{content.summary.columns.cost}</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.provider}-${row.model}`}><td><span className={`admin-ai-provider-pill admin-ai-provider-pill--${row.provider.toLowerCase()}`}>{row.provider}</span></td><td><strong>{row.model}</strong></td><td>{number.format(row.totalRequests)}</td><td className="is-success">{number.format(row.succeededRequests)}</td><td className={row.failedRequests ? 'is-danger' : ''}>{number.format(row.failedRequests)}</td><td>{row.totalRequests ? `${((row.failedRequests / row.totalRequests) * 100).toFixed(1)}%` : '0%'}</td><td>{number.format(row.inputTokens)}</td><td>{number.format(row.outputTokens)}</td><td>{number.format(row.totalTokens)}</td><td>{cost(row.estimatedCostUsd, content.summary.noPricing)}</td></tr>)}</tbody></table>}</div>
  </section>
}
