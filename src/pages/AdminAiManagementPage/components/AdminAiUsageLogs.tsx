import { useState } from 'react'
import { CopyIcon } from '../../../assets/icons/admin'
import type { AdminAiManagementTranslations } from '../../../i18n/types'
import type { AdminAiProvider, AdminAiUsageLog, AdminAiUsageLogQuery, AdminAiUsageStatus, AdminAiSupportedModel } from '../../../types/admin.types'
import { AdminPagination } from '../../_components/admin/AdminPagination'
import { LoadingSkeleton } from '../../_components/admin/LoadingSkeleton'
import { AdminAiInlineError } from './AdminAiInlineError'

type Props = { content: AdminAiManagementTranslations; data: AdminAiUsageLog[]; filters: AdminAiUsageLogQuery; isError: boolean; isFetching: boolean; isLoading: boolean; models: AdminAiSupportedModel[]; onCopy: (value: string) => void; onFilterChange: (query: AdminAiUsageLogQuery) => void; onPageChange: (page: number) => void; onRetry: () => void; total: number; totalPages: number }
const number = new Intl.NumberFormat()
const shortId = (value: string) => value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value

function CopyableId({ label, onCopy, value }: { label: string; onCopy: (value: string) => void; value: string | null }) {
  if (!value) return <span>—</span>
  return <button className="admin-ai-copy" onClick={() => onCopy(value)} title={value} type="button"><span>{shortId(value)}</span><CopyIcon /><span className="sr-only">{label}</span></button>
}

export function AdminAiUsageLogs({ content, data, filters, isError, isFetching, isLoading, models, onCopy, onFilterChange, onPageChange, onRetry, total, totalPages }: Props) {
  const [draftCvId, setDraftCvId] = useState(filters.candidateCvId ?? '')
  const update = (patch: Partial<AdminAiUsageLogQuery>) => onFilterChange({ ...filters, ...patch, page: 1 })
  const clear = () => { setDraftCvId(''); onFilterChange({ page: 1, limit: filters.limit }) }
  return <section className="admin-ai-usage-section"><header className="admin-ai-section-heading"><div><h2>{content.logs.title}</h2><p>{content.logs.description}</p></div><strong>{content.logs.count.replace('{{count}}', String(total))}</strong></header>
    <div className="admin-ai-panel admin-ai-log-filters">
      <label><span>{content.logs.provider}</span><select onChange={(event) => update({ provider: (event.target.value || undefined) as AdminAiProvider | undefined })} value={filters.provider ?? ''}><option value="">{content.logs.allProviders}</option><option value="GEMINI">Gemini</option><option value="OPENAI">OpenAI</option></select></label>
      <label><span>{content.logs.model}</span><select onChange={(event) => update({ model: event.target.value || undefined })} value={filters.model ?? ''}><option value="">{content.logs.allModels}</option>{models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
      <label><span>{content.logs.status}</span><select onChange={(event) => update({ status: (event.target.value || undefined) as AdminAiUsageStatus | undefined })} value={filters.status ?? ''}><option value="">{content.logs.allStatuses}</option><option value="SUCCEEDED">{content.logs.succeeded}</option><option value="FAILED">{content.logs.failed}</option></select></label>
      <label><span>{content.logs.dateFrom}</span><input onChange={(event) => update({ from: event.target.value ? new Date(`${event.target.value}T00:00:00`).toISOString() : undefined })} type="date" value={filters.from?.slice(0, 10) ?? ''} /></label>
      <label><span>{content.logs.dateTo}</span><input onChange={(event) => update({ to: event.target.value ? new Date(`${event.target.value}T23:59:59.999`).toISOString() : undefined })} type="date" value={filters.to?.slice(0, 10) ?? ''} /></label>
      <label className="admin-ai-log-filters__cv"><span>{content.logs.candidateCvId}</span><div><input onChange={(event) => setDraftCvId(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') update({ candidateCvId: draftCvId.trim() || undefined }) }} placeholder={content.logs.candidateCvId} value={draftCvId} /><button onClick={() => update({ candidateCvId: draftCvId.trim() || undefined })} type="button">{content.logs.apply}</button></div></label>
      <button className="admin-ai-clear-button" disabled={!filters.provider && !filters.model && !filters.status && !filters.candidateCvId && !filters.from && !filters.to} onClick={clear} type="button">{content.logs.clear}</button>
    </div>
    <div className="admin-ai-panel admin-ai-logs-panel">{isLoading ? <LoadingSkeleton ariaLabel={content.logs.loading} lines={8} /> : isError ? <AdminAiInlineError actionLabel={content.logs.retry} description={content.logs.errorDescription} onRetry={onRetry} title={content.logs.errorTitle} /> : data.length === 0 ? <div className="admin-ai-empty"><strong>{content.logs.emptyTitle}</strong><p>{content.logs.emptyDescription}</p></div> : <div className={isFetching ? 'admin-ai-table-loading' : ''}><table className="admin-ai-logs-table"><thead><tr><th>{content.logs.columns.request}</th><th>{content.logs.columns.providerModel}</th><th>{content.logs.columns.status}</th><th>{content.logs.columns.tokens}</th><th>{content.logs.columns.latency}</th><th>{content.logs.columns.cost}</th><th>{content.logs.columns.createdAt}</th><th>{content.logs.columns.error}</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td><CopyableId label={content.logs.copy} onCopy={onCopy} value={item.parseRequestId} /><small>CV: <CopyableId label={content.logs.copy} onCopy={onCopy} value={item.candidateCvId} /></small></td><td><span className={`admin-ai-provider-pill admin-ai-provider-pill--${item.provider.toLowerCase()}`}>{item.provider}</span><small>{item.model}</small></td><td><span className={`admin-ai-status admin-ai-status--${item.status.toLowerCase()}`}>{item.status === 'SUCCEEDED' ? content.logs.succeeded : content.logs.failed}</span></td><td>{item.totalTokens == null ? content.logs.noValue : number.format(item.totalTokens)}<small>{item.inputTokens == null ? '—' : number.format(item.inputTokens)} / {item.outputTokens == null ? '—' : number.format(item.outputTokens)}</small></td><td>{item.latencyMs == null ? content.logs.noValue : `${number.format(item.latencyMs)} ms`}</td><td>{item.estimatedCostUsd == null ? content.logs.noPricing : `$${Number(item.estimatedCostUsd).toFixed(4)}`}</td><td>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</td><td>{item.status === 'FAILED' ? <><strong className="is-danger">{item.errorCode ?? content.logs.noValue}</strong><small title={item.errorMessage ?? undefined}>{item.errorMessage ?? content.logs.noValue}</small></> : content.logs.noValue}</td></tr>)}</tbody></table></div>}</div>
    <AdminPagination labels={content.pagination} onPageChange={onPageChange} page={filters.page ?? 1} totalPages={totalPages} />
  </section>
}
