import { useRef, type ChangeEvent } from 'react'
import { DismissIcon, SearchIcon } from '../../../assets/icons/admin'
import type { AdminCompaniesTranslations } from '../../../i18n/types'
import type { AdminCompanySort, CompanyStatus, CompanyTrustLevel } from '../../../types/admin.types'
import { SelectField } from '../../_components'

type Props = {
  content: AdminCompaniesTranslations['filters']; hasActiveFilters: boolean; isSearching: boolean
  onClear: () => void; onQueryChange: (value: string) => void; onRejectedBeforeChange: (value: boolean) => void
  onSortChange: (value: AdminCompanySort) => void; onStatusChange: (value: CompanyStatus | 'all') => void
  onTrustLevelChange: (value: CompanyTrustLevel | 'all') => void; query: string; rejectedBefore: boolean
  sort: AdminCompanySort; status: CompanyStatus | 'all'; statusesLabel: AdminCompaniesTranslations['statuses']
  trustLevel: CompanyTrustLevel | 'all'; trustLevelsLabel: AdminCompaniesTranslations['trustLevels']
}

export function CompanyReviewFilters(props: Props) {
  const { content, hasActiveFilters, isSearching, onClear, onQueryChange, onRejectedBeforeChange, onSortChange, onStatusChange, onTrustLevelChange, query, rejectedBefore, sort, status, statusesLabel, trustLevel, trustLevelsLabel } = props
  const queryInputRef = useRef<HTMLInputElement>(null)
  const clearQuery = () => {
    onQueryChange('')
    queryInputRef.current?.focus()
  }

  return <form aria-label={content.queryLabel} className="admin-users-filters admin-companies-filters" onSubmit={(event) => event.preventDefault()} role="search">
    <label className={`admin-filter admin-filter--query${isSearching ? ' is-searching' : ''}`}><span className="sr-only">{content.queryLabel}</span><span aria-hidden="true" className="admin-filter__icon"><SearchIcon /></span><input aria-label={content.queryLabel} className="admin-filter__input" onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)} placeholder={content.queryPlaceholder} ref={queryInputRef} type="text" value={query} />{query ? <button aria-label={content.clear} className="admin-filter__query-clear" onClick={clearQuery} type="button"><DismissIcon /></button> : null}</label>
    <SelectField className="admin-filter admin-filter--select" label={content.statusLabel} menuClassName="admin-filter-menu" onChange={(value) => onStatusChange(value as CompanyStatus | 'all')} options={[{ label: content.statusAll, value: 'all' }, { label: statusesLabel.pending, value: 'PENDING' }, { label: statusesLabel.approved, value: 'APPROVED' }, { label: statusesLabel.rejected, value: 'REJECTED' }, { label: statusesLabel.suspended, value: 'SUSPENDED' }]} value={status} />
    <SelectField className="admin-filter admin-filter--select" label={content.trustLevelLabel} menuClassName="admin-filter-menu" onChange={(value) => onTrustLevelChange(value as CompanyTrustLevel | 'all')} options={[{ label: content.trustLevelAll, value: 'all' }, { label: trustLevelsLabel.low, value: 'LOW' }, { label: trustLevelsLabel.medium, value: 'MEDIUM' }, { label: trustLevelsLabel.high, value: 'HIGH' }]} value={trustLevel} />
    <SelectField className="admin-filter admin-filter--select" label={content.sortLabel} menuClassName="admin-filter-menu" onChange={(value) => onSortChange(value as AdminCompanySort)} options={[{ label: content.sortLatest, value: 'latest' }, { label: content.sortOldest, value: 'oldest' }, { label: content.sortRejected, value: 'rejected_count_desc' }]} value={sort} />
    <label className="admin-company-rejected-filter"><input checked={rejectedBefore} onChange={(event) => onRejectedBeforeChange(event.target.checked)} type="checkbox" /><span>{content.rejectedBefore}</span></label>
    <button className="admin-filter__clear" disabled={!hasActiveFilters} onClick={onClear} type="button">{content.clear}</button>
  </form>
}
