import type { ChangeEvent } from 'react'
import type { AdminUsersTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type { AdminUserRole, AdminUserStatus } from '../types'

type AdminUserFiltersProps = {
  content: AdminUsersTranslations['filters']
  hasActiveFilters: boolean
  onClear: () => void
  onQueryChange: (value: string) => void
  onRoleChange: (value: AdminUserRole | 'all') => void
  query: string
  role: AdminUserRole | 'all'
  rolesLabel: AdminUsersTranslations['roles']
  roleTone: (role: AdminUserRole) => 'admin' | 'employer' | 'candidate'
  status: AdminUserStatus | 'all'
  statusLabel: AdminUsersTranslations['statuses']
  onStatusChange: (value: AdminUserStatus | 'all') => void
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function AdminUserFilters({
  content,
  hasActiveFilters,
  onClear,
  onQueryChange,
  onRoleChange,
  onStatusChange,
  query,
  role,
  rolesLabel,
  roleTone,
  status,
  statusLabel,
}: AdminUserFiltersProps) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value)
  }

  function handleRoleChange(value: string) {
    onRoleChange(value as AdminUserRole | 'all')
  }

  function handleStatusChange(value: string) {
    onStatusChange(value as AdminUserStatus | 'all')
  }

  return (
    <form
      aria-label={content.queryLabel}
      className="admin-users-filters"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <label className="admin-filter admin-filter--query">
        <span className="sr-only">{content.queryLabel}</span>
        <span aria-hidden="true" className="admin-filter__icon">
          <SearchIcon />
        </span>
        <input
          aria-label={content.queryLabel}
          className="admin-filter__input"
          onChange={handleQueryChange}
          placeholder={content.queryPlaceholder}
          type="search"
          value={query}
        />
      </label>

      <SelectField
        className="admin-filter admin-filter--select"
        label={content.roleLabel}
        onChange={handleRoleChange}
        options={[
          { label: content.roleAll, value: 'all' },
          { label: rolesLabel.admin, value: 'admin' },
          { label: rolesLabel.employer, value: 'employer' },
          { label: rolesLabel.candidate, value: 'candidate' },
        ]}
        value={role}
      />

      <SelectField
        className="admin-filter admin-filter--select"
        label={content.statusLabel}
        onChange={handleStatusChange}
        options={[
          { label: content.statusAll, value: 'all' },
          { label: statusLabel.active, value: 'active' },
          { label: statusLabel.locked, value: 'locked' },
          { label: statusLabel.invited, value: 'invited' },
        ]}
        value={status}
      />

      <button
        aria-label={content.clear}
        className="admin-filter__clear"
        disabled={!hasActiveFilters}
        onClick={onClear}
        type="button"
      >
        {content.clear}
      </button>
      {/* roleTone is provided by parent for future variant binding; silence unused warning */}
      <span aria-hidden="true" className="sr-only" data-tone={roleTone('admin')} />
    </form>
  )
}
