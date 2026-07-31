import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminShieldIcon, CandidateIcon, RecruiterIcon, UsersGroupIcon } from '../../assets/icons/admin'
import { useAuth, useToast } from '../../context'
import { useAdminUserAction, useAdminUsers, useAdminUsersOverview } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { getApiErrorCode } from '../../lib/api/apiError'
import type { AdminUserRole, AdminUserStatus } from '../../types/admin.types'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { ReasonModal } from '../_components/admin/ReasonModal'
import { AdminUserFilters } from './components/AdminUserFilters'
import { AdminUserMobileList } from './components/AdminUserMobileList'
import { AdminUserStatusOverview } from './components/AdminUserStatusOverview'
import { AdminUserTable } from './components/AdminUserTable'
import type { AdminUser, AdminUserAction } from './types'
import { toAdminUserView } from './utils/adminUserView'

const PAGE_SIZE = 20

export function AdminUsersPage() {
  const { pages } = useTranslations()
  const content = pages.adminUsers
  const navigate = useNavigate()
  const toast = useToast()
  const { user: currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [role, setRole] = useState<AdminUserRole | 'all'>('all')
  const [status, setStatus] = useState<AdminUserStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState<{ action: AdminUserAction; user: AdminUser } | null>(null)
  const actionMutation = useAdminUserAction(pendingAction?.action ?? 'suspend')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])
  useEffect(() => setPage(1), [debouncedQuery, role, status])

  const listQuery = useAdminUsers({ page, limit: PAGE_SIZE, search: debouncedQuery || undefined, role: role === 'all' ? undefined : role, status: status === 'all' ? undefined : status })
  const overviewQuery = useAdminUsersOverview()
  const users = useMemo(() => (listQuery.data?.data ?? []).map(toAdminUserView), [listQuery.data])
  const total = listQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const overview = overviewQuery.data

  const submitAction = (reason: string) => {
    if (!pendingAction) return
    actionMutation.mutate(
      { userId: pendingAction.user.id, payload: { reason } },
      {
        onSuccess: () => {
          toast.success(content.feedback.actionSuccess)
          setPendingAction(null)
        },
        onError: (error) => {
          toast.error(getApiErrorCode(error) === 'AUTH.CANNOT_MANAGE_SELF' ? content.feedback.cannotManageSelf : content.feedback.actionError)
        },
      },
    )
  }

  if (listQuery.isPending || overviewQuery.isPending) return <div className="admin-users-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={10} /></div>
  if (listQuery.isError || overviewQuery.isError || !overview) return <div className="admin-users-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void Promise.all([listQuery.refetch(), overviewQuery.refetch()])} title={content.feedback.errorTitle} /></div>

  const activeFilters = Boolean(query.trim() || role !== 'all' || status !== 'all')
  return <div className="admin-users-page">
    <header className="admin-users-page__header"><p className="admin-users-page__subtitle">{content.pageSubtitle}</p></header>
    <div className="admin-users-stats">
      <AdminStatCard icon={<UsersGroupIcon />} label={content.stats.totalLabel} tone="blue" value={overview.total} />
      <AdminStatCard icon={<CandidateIcon />} label={content.stats.candidatesLabel} tone="violet" value={overview.byRole.CANDIDATE} />
      <AdminStatCard icon={<RecruiterIcon />} label={content.stats.employersLabel} tone="coral" value={overview.byRole.RECRUITER} />
      <AdminStatCard icon={<AdminShieldIcon />} label={content.stats.adminsLabel} tone="amber" value={overview.byRole.ADMIN} />
    </div>
    <AdminUserStatusOverview
      activeStatus={status}
      content={content.statusOverview}
      counts={overview.byStatus}
      onStatusChange={(nextStatus) => setStatus((current) => current === nextStatus ? 'all' : nextStatus)}
      statusLabels={content.statuses}
      total={overview.total}
    />
    <AdminUserFilters content={content.filters} hasActiveFilters={activeFilters} onClear={() => { setQuery(''); setRole('all'); setStatus('all') }} onQueryChange={setQuery} onRoleChange={setRole} onStatusChange={setStatus} query={query} role={role} rolesLabel={content.roles} status={status} statusLabel={content.statuses} />
    <div className="admin-users-results"><header className="admin-users-results__header"><p className="admin-users-results__count">{content.results.countLabel.replace('{{count}}', String(total))}</p></header>
      {users.length === 0 ? <div className="admin-users-empty"><p className="admin-users-empty__title">{content.results.emptyTitle}</p><p className="admin-users-empty__description">{content.results.emptyDescription}</p></div> : <>
        <AdminUserTable actions={content.results} columns={content.results.columns} currentUserId={currentUser?.id} onAction={(action, user) => setPendingAction({ action, user })} onView={(user) => navigate(`/admin/users/${user.id}`)} rolesLabel={content.roles} statusesLabel={content.statuses} users={users} />
        <AdminUserMobileList actions={content.results} columns={content.results.columns} currentUserId={currentUser?.id} onAction={(action, user) => setPendingAction({ action, user })} onView={(user) => navigate(`/admin/users/${user.id}`)} rolesLabel={content.roles} statusesLabel={content.statuses} users={users} />
      </>}
    </div>
    <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />
    <ReasonModal cancelLabel={content.actions.cancel} confirmLabel={pendingAction ? content.actions[pendingAction.action] : content.actions.confirm} description={pendingAction ? content.actions.description.replace('{{name}}', pendingAction.user.name) : undefined} inputLabel={content.actions.reasonLabel} isOpen={Boolean(pendingAction)} isPending={actionMutation.isPending} onCancel={() => setPendingAction(null)} onConfirm={submitAction} placeholder={content.actions.reasonPlaceholder} requiredMessage={content.actions.reasonRequired} title={content.actions.title} />
  </div>
}

export default AdminUsersPage
