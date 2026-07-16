import { useEffect, useMemo, useState } from 'react'
import { getTranslations } from '../../i18n'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { AdminUserFilters } from './components/AdminUserFilters'
import { AdminUserMobileList } from './components/AdminUserMobileList'
import { AdminUserTable } from './components/AdminUserTable'
import { adminUsersFixture, computeAdminStats } from './utils/adminUsersData'
import { filterAdminUsers, isActiveFilters } from './utils/adminUsersFilters'
import type { AdminUser, AdminUserRole, AdminUserStatus } from './types'

const PAGE_SIZE = 8

function UsersGroupIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="17" cy="11" r="2.8" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M15 19a4 4 0 0 1 6 0" />
    </svg>
  )
}

function CandidateIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function EmployerIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function LockedIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function AdminUsersPage() {
  const { pages } = getTranslations()
  const content = pages.adminUsers
  const stats = useMemo(() => computeAdminStats(adminUsersFixture), [])

  const [query, setQuery] = useState('')
  const [role, setRole] = useState<AdminUserRole | 'all'>('all')
  const [status, setStatus] = useState<AdminUserStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () => filterAdminUsers(adminUsersFixture, { query, role, status }),
    [query, role, status],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [query, role, status])

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handlers = {
    onDelete(user: AdminUser) {
      // Stub: phase này không nối API. Xác nhận trước khi xóa để tránh thao tác nhầm.
      if (typeof window !== 'undefined') {
        window.alert(`${content.results.actionDelete}: ${user.name}`)
      }
    },
    onLock(user: AdminUser) {
      if (typeof window !== 'undefined') {
        window.alert(`${content.results.actionLock}: ${user.name}`)
      }
    },
    onUnlock(user: AdminUser) {
      if (typeof window !== 'undefined') {
        window.alert(`${content.results.actionUnlock}: ${user.name}`)
      }
    },
    onView(user: AdminUser) {
      if (typeof window !== 'undefined') {
        window.alert(`${content.results.actionView}: ${user.name}`)
      }
    },
  }

  const activeFilters = isActiveFilters({ query, role, status })

  return (
    <div className="admin-users-page">
      <header className="admin-users-page__header">
        <p className="admin-users-page__subtitle">{content.pageSubtitle}</p>
      </header>

      <div className="admin-users-stats">
        <AdminStatCard
          delta={content.stats.totalDelta}
          icon={<UsersGroupIcon />}
          label={content.stats.totalLabel}
          tone="blue"
          value={stats.total}
        />
        <AdminStatCard
          delta={content.stats.candidatesDelta}
          icon={<CandidateIcon />}
          label={content.stats.candidatesLabel}
          tone="violet"
          value={stats.candidates}
        />
        <AdminStatCard
          delta={content.stats.employersDelta}
          icon={<EmployerIcon />}
          label={content.stats.employersLabel}
          tone="coral"
          value={stats.employers}
        />
        <AdminStatCard
          delta={content.stats.lockedDelta}
          icon={<LockedIcon />}
          label={content.stats.lockedLabel}
          tone="amber"
          value={stats.locked}
        />
      </div>

      <AdminUserFilters
        content={content.filters}
        hasActiveFilters={activeFilters}
        onClear={() => {
          setQuery('')
          setRole('all')
          setStatus('all')
        }}
        onQueryChange={setQuery}
        onRoleChange={setRole}
        onStatusChange={setStatus}
        query={query}
        role={role}
        rolesLabel={content.roles}
        roleTone={(value) => (value === 'admin' ? 'admin' : value === 'employer' ? 'employer' : 'candidate')}
        status={status}
        statusLabel={content.statuses}
      />

      <div className="admin-users-results">
        <header className="admin-users-results__header">
          <p className="admin-users-results__count">
            {content.results.countLabel.replace('{{count}}', String(filtered.length))}
          </p>
        </header>

        {filtered.length === 0 ? (
          <div className="admin-users-empty">
            <p className="admin-users-empty__title">{content.results.emptyTitle}</p>
            <p className="admin-users-empty__description">{content.results.emptyDescription}</p>
          </div>
        ) : (
          <>
            <AdminUserTable
              actions={content.results}
              columns={content.results.columns}
              handlers={handlers}
              rolesLabel={content.roles}
              statusesLabel={content.statuses}
              users={paged}
            />
            <AdminUserMobileList
              actions={content.results}
              columns={content.results.columns}
              handlers={handlers}
              rolesLabel={content.roles}
              statusesLabel={content.statuses}
              users={paged}
            />
          </>
        )}
      </div>

      <AdminPagination
        labels={content.pagination}
        onPageChange={setPage}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}

export default AdminUsersPage
