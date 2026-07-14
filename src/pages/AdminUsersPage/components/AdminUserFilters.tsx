import type { ChangeEvent } from 'react'
import type { AdminUsersTranslations } from '../../../i18n/types'
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

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    onRoleChange(event.target.value as AdminUserRole | 'all')
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusChange(event.target.value as AdminUserStatus | 'all')
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

      <label className="admin-filter">
        <span className="admin-filter__label">{content.roleLabel}</span>
        <select
          aria-label={content.roleLabel}
          className="admin-filter__select"
          onChange={handleRoleChange}
          value={role}
        >
          <option value="all">{content.roleAll}</option>
          <option value="admin">{rolesLabel.admin}</option>
          <option value="employer">{rolesLabel.employer}</option>
          <option value="candidate">{rolesLabel.candidate}</option>
        </select>
      </label>

      <label className="admin-filter">
        <span className="admin-filter__label">{content.statusLabel}</span>
        <select
          aria-label={content.statusLabel}
          className="admin-filter__select"
          onChange={handleStatusChange}
          value={status}
        >
          <option value="all">{content.statusAll}</option>
          <option value="active">{statusLabel.active}</option>
          <option value="locked">{statusLabel.locked}</option>
          <option value="invited">{statusLabel.invited}</option>
        </select>
      </label>

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
