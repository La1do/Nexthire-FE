import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminShieldIcon, ArchiveIcon, RestoreIcon, SuspendIcon } from '../../assets/icons/admin'
import { useToast } from '../../context'
import { useAdminCompanies, useAdminDashboardOverview, useAdminJobs, useAdminJobReviewQueue, useAdminJobStatusAction, useAdminRevisionReviewQueue, useReviewAdminJob, useReviewAdminRevision, useAdminJobDetail, useAdminJobRevisionDetail } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { getApiErrorCode } from '../../lib/api/apiError'
import type { AdminJobReviewStatus, AdminJobSort, AdminRevisionReviewStatus } from '../../types/admin.types'
import type { JobModerationRiskLevel, JobStatus } from '../../types/job.types'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ConfirmModal } from '../_components/admin/ConfirmModal'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { ReasonModal } from '../_components/admin/ReasonModal'
import { AdminJobDetailDrawer } from './components/AdminJobDetailDrawer'
import { AdminJobFilters } from './components/AdminJobFilters'
import { AdminJobsMobileList } from './components/AdminJobsMobileList'
import { AdminJobsTable } from './components/AdminJobsTable'
import type { AdminJobAction, AdminJobRow, AdminJobsTab, PendingAdminJobAction } from './types'

const PAGE_SIZE = 20

function isJobsTab(value: string | null): value is AdminJobsTab {
  return value === 'all' || value === 'review' || value === 'revisions'
}

export function AdminJobsPage() {
  const { pages } = useTranslations()
  const content = pages.adminJobs
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = isJobsTab(searchParams.get('tab')) ? searchParams.get('tab') as AdminJobsTab : 'all'
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<JobStatus | 'all'>('all')
  const [risk, setRisk] = useState<JobModerationRiskLevel | 'all'>('all')
  const [companyId, setCompanyId] = useState('all')
  const [sort, setSort] = useState<AdminJobSort>('latest')
  const [page, setPage] = useState(1)
  const [detailItem, setDetailItem] = useState<AdminJobRow | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAdminJobAction | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])
  useEffect(() => { const external = searchParams.get('search') ?? ''; setQuery((current) => current === external ? current : external) }, [searchParams])
  useEffect(() => { setSearchParams((current) => { const next = new URLSearchParams(current); if (debouncedQuery) next.set('search', debouncedQuery); else next.delete('search'); return next }, { replace: true }) }, [debouncedQuery, setSearchParams])
  useEffect(() => setPage(1), [debouncedQuery, status, risk, companyId, sort, tab])

  const urlJobId = searchParams.get('jobId')
  const urlRevisionId = searchParams.get('revisionId')
  const jobDetailQuery = useAdminJobDetail(urlJobId ?? undefined)
  const revisionDetailQuery = useAdminJobRevisionDetail(urlRevisionId ?? undefined)

  useEffect(() => {
    if (jobDetailQuery.data) {
      setDetailItem(jobDetailQuery.data)
      setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('jobId'); return next }, { replace: true })
    }
  }, [jobDetailQuery.data, setSearchParams])

  useEffect(() => {
    if (revisionDetailQuery.data) {
      setDetailItem(revisionDetailQuery.data)
      setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('revisionId'); return next }, { replace: true })
    }
  }, [revisionDetailQuery.data, setSearchParams])

  const allQuery = useAdminJobs({ page, limit: PAGE_SIZE, search: debouncedQuery || undefined, status: status === 'all' ? undefined : status, riskLevel: risk === 'all' ? undefined : risk, companyId: companyId === 'all' ? undefined : companyId, sort }, tab === 'all')
  const reviewQuery = useAdminJobReviewQueue({ page, limit: PAGE_SIZE, search: debouncedQuery || undefined, status: status === 'all' ? undefined : status as AdminJobReviewStatus }, tab === 'review')
  const revisionQuery = useAdminRevisionReviewQueue({ page, limit: PAGE_SIZE, search: debouncedQuery || undefined, status: status === 'all' ? undefined : status as AdminRevisionReviewStatus }, tab === 'revisions')
  const companyQuery = useAdminCompanies({ page: 1, limit: 100, sort: 'latest' })
  const overviewQuery = useAdminDashboardOverview()

  const actionId = pendingAction?.item.id ?? 'missing'
  const reviewMutation = useReviewAdminJob(actionId)
  const revisionMutation = useReviewAdminRevision(actionId)
  const statusMutation = useAdminJobStatusAction(actionId, pendingAction?.action === 'republish' ? 'republish' : pendingAction?.action === 'close' ? 'close' : 'unpublish')
  const activeQuery = tab === 'all' ? allQuery : tab === 'review' ? reviewQuery : revisionQuery
  const items = (activeQuery.data?.data ?? []) as AdminJobRow[]
  const total = activeQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const overview = overviewQuery.data?.jobs
  const companyOptions = useMemo(() => (companyQuery.data?.data ?? []).map((company) => ({ label: company.name, value: company.id })), [companyQuery.data])
  const hasActiveFilters = Boolean(query.trim() || status !== 'all' || risk !== 'all' || companyId !== 'all' || sort !== 'latest')
  const isMutationPending = reviewMutation.isPending || revisionMutation.isPending || statusMutation.isPending

  const changeTab = (nextTab: AdminJobsTab) => {
    setSearchParams((current) => { const next = new URLSearchParams(current); if (nextTab === 'all') next.delete('tab'); else next.set('tab', nextTab); return next })
    setStatus('all'); setRisk('all'); setCompanyId('all'); setSort('latest'); setQuery('')
  }

  const openAction = (action: AdminJobAction, item: AdminJobRow, revision: boolean) => setPendingAction({ action, item, revision })
  const completeAction = (reason?: string) => {
    if (!pendingAction) return
    const callbacks = { onSuccess: () => { toast.success(content.feedback.actionSuccess); setPendingAction(null); setDetailItem(null) }, onError: (error: unknown) => toast.error(`${content.feedback.actionError} (${getApiErrorCode(error) ?? 'COMMON.UNKNOWN_ERROR'})`) }
    if (pendingAction.revision) {
      revisionMutation.mutate({ decision: pendingAction.action === 'approve' ? 'APPROVE' : 'REJECT', reason }, callbacks)
    } else if (pendingAction.action === 'approve' || pendingAction.action === 'reject') {
      reviewMutation.mutate({ decision: pendingAction.action === 'approve' ? 'APPROVE' : 'REJECT', reason }, callbacks)
    } else {
      statusMutation.mutate(pendingAction.action === 'republish' ? undefined : { reason }, callbacks)
    }
  }

  const actionLabel = pendingAction ? content.actions[pendingAction.action] : ''
  const actionTitle = pendingAction?.item.title ?? ''
  const isConfirmAction = pendingAction?.action === 'approve' || pendingAction?.action === 'republish'

  if (activeQuery.isPending) return <div className="admin-jobs-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={12} /></div>
  if (activeQuery.isError && !activeQuery.data) return <div className="admin-jobs-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void activeQuery.refetch()} title={content.feedback.errorTitle} /></div>

  return <div className="admin-jobs-page">
    <header className="admin-jobs-page__header"><p>{content.pageSubtitle}</p></header>
    <div className="admin-users-stats admin-jobs-stats"><AdminStatCard icon={<ArchiveIcon />} label={content.stats.total} tone="blue" value={overview?.totalJobs ?? 0} /><AdminStatCard icon={<AdminShieldIcon />} label={content.stats.review} tone="amber" value={overview?.jobsWaitingReview ?? 0} /><AdminStatCard icon={<RestoreIcon />} label={content.stats.published} tone="coral" value={overview?.publishedJobs ?? 0} /><AdminStatCard icon={<SuspendIcon />} label={content.stats.revisions} tone="violet" value={overview?.revisionsWaitingReview ?? 0} /></div>
    <nav aria-label={content.pageTitle} className="admin-jobs-tabs">{(['all', 'review', 'revisions'] as const).map((value) => <button aria-current={tab === value ? 'page' : undefined} className={tab === value ? 'is-active' : ''} key={value} onClick={() => changeTab(value)} type="button">{content.tabs[value]}{value === 'review' && overview ? <span>{overview.jobsWaitingReview}</span> : null}{value === 'revisions' && overview ? <span>{overview.revisionsWaitingReview}</span> : null}</button>)}</nav>
    <AdminJobFilters companyId={companyId} companyOptions={companyOptions} content={content.filters} hasActiveFilters={hasActiveFilters} isSearching={activeQuery.isFetching} onClear={() => { setQuery(''); setStatus('all'); setRisk('all'); setCompanyId('all'); setSort('latest') }} onCompanyChange={setCompanyId} onQueryChange={setQuery} onRiskChange={setRisk} onSortChange={setSort} onStatusChange={setStatus} query={query} risk={risk} riskLabels={content.risks} sort={sort} sortLabels={content.sorts} status={status} statusLabels={content.statuses} tab={tab} />
    {activeQuery.error ? <div className="admin-users-search-error" role="alert"><span>{content.feedback.errorDescription}</span><button onClick={() => void activeQuery.refetch()} type="button">{content.feedback.retry}</button></div> : null}
    <section className="admin-users-results admin-jobs-results"><header className="admin-users-results__header"><p className="admin-users-results__count">{content.feedback.countLabel.replace('{{count}}', String(total))}</p></header>{items.length === 0 ? <div className="admin-users-empty"><p className="admin-users-empty__title">{content.feedback.emptyTitle}</p><p className="admin-users-empty__description">{content.feedback.emptyDescription}</p></div> : <><AdminJobsTable content={content} items={items} onAction={openAction} onView={setDetailItem} /><AdminJobsMobileList content={content} items={items} onAction={openAction} onView={setDetailItem} /></>}</section>
    <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />
    <AdminJobDetailDrawer content={content} item={detailItem} onClose={() => setDetailItem(null)} />
    <ConfirmModal cancelLabel={content.actions.cancel} confirmLabel={actionLabel} description={content.actions.confirmDescription.replace('{{action}}', actionLabel.toLowerCase()).replace('{{title}}', actionTitle)} isOpen={Boolean(pendingAction && isConfirmAction)} isPending={isMutationPending} onCancel={() => setPendingAction(null)} onConfirm={() => completeAction()} title={content.actions.confirmTitle} />
    <ReasonModal cancelLabel={content.actions.cancel} confirmLabel={actionLabel} description={content.actions.reasonDescription.replace('{{action}}', actionLabel.toLowerCase()).replace('{{title}}', actionTitle)} inputLabel={content.actions.reasonLabel} isOpen={Boolean(pendingAction && !isConfirmAction)} isPending={isMutationPending} onCancel={() => setPendingAction(null)} onConfirm={completeAction} placeholder={content.actions.reasonPlaceholder} requiredMessage={content.actions.reasonRequired} title={content.actions.reasonTitle} />
  </div>
}

export default AdminJobsPage
