import type { ChangeEvent } from 'react'
import type { AdminUsersTranslations } from '../../../i18n/types'
import { SearchIcon } from '../../../assets/icons/admin'
import { SelectField } from '../../_components'
import type { AdminUserRole, AdminUserStatus } from '../types'

type AdminUserFiltersProps = {
  content: AdminUsersTranslations['filters']
  hasActiveFilters: boolean
  onClear: () => void
  onQueryChange: (value: string) => void
  onRoleChange: (value: AdminUserRole | 'all') => void
  onStatusChange: (value: AdminUserStatus | 'all') => void
  query: string
  role: AdminUserRole | 'all'
  rolesLabel: AdminUsersTranslations['roles']
  status: AdminUserStatus | 'all'
  statusLabel: AdminUsersTranslations['statuses']
}

export function AdminUserFilters(props: AdminUserFiltersProps) {
  const { content, hasActiveFilters, onClear, onQueryChange, onRoleChange, onStatusChange, query, role, rolesLabel, status, statusLabel } = props
  return (
    <form aria-label={content.queryLabel} className="admin-users-filters" onSubmit={(event) => event.preventDefault()} role="search">
      <label className="admin-filter admin-filter--query">
        <span className="sr-only">{content.queryLabel}</span>
        <span aria-hidden="true" className="admin-filter__icon"><SearchIcon /></span>
        <input aria-label={content.queryLabel} className="admin-filter__input" onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)} placeholder={content.queryPlaceholder} type="search" value={query} />
      </label>
      <SelectField className="admin-filter admin-filter--select" label={content.roleLabel} menuClassName="admin-filter-menu" onChange={(value) => onRoleChange(value as AdminUserRole | 'all')} options={[
        { label: content.roleAll, value: 'all' },
        { label: rolesLabel.admin, value: 'ADMIN' },
        { label: rolesLabel.recruiter, value: 'RECRUITER' },
        { label: rolesLabel.candidate, value: 'CANDIDATE' },
      ]} value={role} />
      <SelectField className="admin-filter admin-filter--select" label={content.statusLabel} menuClassName="admin-filter-menu" onChange={(value) => onStatusChange(value as AdminUserStatus | 'all')} options={[
        { label: content.statusAll, value: 'all' },
        { label: statusLabel.active, value: 'ACTIVE' },
        { label: statusLabel.inactive, value: 'INACTIVE' },
        { label: statusLabel.suspended, value: 'SUSPENDED' },
        { label: statusLabel.locked, value: 'LOCKED' },
        { label: statusLabel.banned, value: 'BANNED' },
        { label: statusLabel.archived, value: 'ARCHIVED' },
      ]} value={status} />
      <button className="admin-filter__clear" disabled={!hasActiveFilters} onClick={onClear} type="button">{content.clear}</button>
    </form>
  )
}
