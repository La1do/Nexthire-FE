import { useRef, type ChangeEvent } from 'react'
import { DismissIcon, SearchIcon } from '../../../assets/icons/admin'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobSort } from '../../../types/admin.types'
import type { JobModerationRiskLevel, JobStatus } from '../../../types/job.types'
import { SelectField } from '../../_components'
import type { AdminJobsTab } from '../types'

type CompanyOption = { label: string; value: string }
type Props = {
  companyId: string; companyOptions: CompanyOption[]; content: AdminJobsTranslations['filters']
  hasActiveFilters: boolean; isSearching: boolean; onClear: () => void
  onCompanyChange: (value: string) => void; onQueryChange: (value: string) => void
  onRiskChange: (value: JobModerationRiskLevel | 'all') => void
  onSortChange: (value: AdminJobSort) => void; onStatusChange: (value: JobStatus | 'all') => void
  query: string; risk: JobModerationRiskLevel | 'all'; riskLabels: AdminJobsTranslations['risks']
  sort: AdminJobSort; sortLabels: AdminJobsTranslations['sorts']; status: JobStatus | 'all'
  statusLabels: AdminJobsTranslations['statuses']; tab: AdminJobsTab
}

const allStatuses: JobStatus[] = ['DRAFT', 'PENDING_REVIEW', 'NEEDS_REVIEW', 'SHOULD_REJECT', 'PUBLISHED', 'UNPUBLISHED', 'REJECTED', 'CLOSED', 'EXPIRED']
const queueStatuses: JobStatus[] = ['PENDING_REVIEW', 'NEEDS_REVIEW', 'SHOULD_REJECT']
const risks: JobModerationRiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function AdminJobFilters(props: Props) {
  const { companyId, companyOptions, content, hasActiveFilters, isSearching, onClear, onCompanyChange, onQueryChange, onRiskChange, onSortChange, onStatusChange, query, risk, riskLabels, sort, sortLabels, status, statusLabels, tab } = props
  const queryInputRef = useRef<HTMLInputElement>(null)
  const clearQuery = () => {
    onQueryChange('')
    queryInputRef.current?.focus()
  }

  const statuses = tab === 'all' ? allStatuses : queueStatuses
  return <form className="admin-users-filters admin-jobs-filters" onSubmit={(event) => event.preventDefault()} role="search">
    <label className={`admin-filter admin-filter--query${isSearching ? ' is-searching' : ''}`}><span className="sr-only">{content.searchLabel}</span><span aria-hidden="true" className="admin-filter__icon"><SearchIcon /></span><input aria-label={content.searchLabel} className="admin-filter__input" onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)} placeholder={content.searchPlaceholder} ref={queryInputRef} type="text" value={query} />{query ? <button aria-label={content.clear} className="admin-filter__query-clear" onClick={clearQuery} type="button"><DismissIcon /></button> : null}</label>
    <SelectField className="admin-filter admin-filter--select" label={content.statusLabel} menuClassName="admin-filter-menu" onChange={(value) => onStatusChange(value as JobStatus | 'all')} options={[{ label: content.statusAll, value: 'all' }, ...statuses.map((value) => ({ label: statusLabels[value], value }))]} value={status} />
    {tab === 'all' ? <SelectField className="admin-filter admin-filter--select" label={content.riskLabel} menuClassName="admin-filter-menu" onChange={(value) => onRiskChange(value as JobModerationRiskLevel | 'all')} options={[{ label: content.riskAll, value: 'all' }, ...risks.map((value) => ({ label: riskLabels[value], value }))]} value={risk} /> : null}
    {tab === 'all' ? <SelectField className="admin-filter admin-filter--select" label={content.companyLabel} menuClassName="admin-filter-menu" onChange={onCompanyChange} options={[{ label: content.companyAll, value: 'all' }, ...companyOptions]} value={companyId} /> : null}
    {tab === 'all' ? <SelectField className="admin-filter admin-filter--select" label={content.sortLabel} menuClassName="admin-filter-menu" onChange={(value) => onSortChange(value as AdminJobSort)} options={[{ label: sortLabels.latest, value: 'latest' }, { label: sortLabels.oldest, value: 'oldest' }, { label: sortLabels.risk, value: 'risk_desc' }, { label: sortLabels.applications, value: 'applications_desc' }]} value={sort} /> : null}
    <button className="admin-filter__clear" disabled={!hasActiveFilters} onClick={onClear} type="button">{content.clear}</button>
  </form>
}
