import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../context'
import { useAdminCompanies, useAdminCompaniesOverview, useVerifyAdminCompany } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { getApiErrorCode } from '../../lib/api/apiError'
import type { AdminCompany, AdminCompanySort, CompanyStatus, CompanyTrustLevel } from '../../types/admin.types'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ConfirmModal } from '../_components/admin/ConfirmModal'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { ReasonModal } from '../_components/admin/ReasonModal'
import { CompanyReviewFilters } from './components/CompanyReviewFilters'
import { CompanyReviewMobileList } from './components/CompanyReviewMobileList'
import { CompanyReviewTable } from './components/CompanyReviewTable'
import './admin-companies-page.css'

const PAGE_SIZE = 20
const companyStatuses: CompanyStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']

type ReviewAction = { company: AdminCompany; type: 'approve' | 'reject' }

function MetricIcon({ children }: { children: string }) {
  return <span aria-hidden="true" className="admin-company-metric-icon">{children}</span>
}

export function AdminCompaniesPage() {
  const { pages } = useTranslations()
  const content = pages.adminCompanies
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<CompanyStatus | 'all'>(() => companyStatuses.includes(searchParams.get('status') as CompanyStatus) ? searchParams.get('status') as CompanyStatus : 'all')
  const [trustLevel, setTrustLevel] = useState<CompanyTrustLevel | 'all'>('all')
  const [rejectedBefore, setRejectedBefore] = useState(false)
  const [sort, setSort] = useState<AdminCompanySort>('latest')
  const [page, setPage] = useState(1)
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])
  useEffect(() => { const external = searchParams.get('search') ?? ''; setQuery((current) => current === external ? current : external); const nextStatus = searchParams.get('status'); if (companyStatuses.includes(nextStatus as CompanyStatus)) setStatus(nextStatus as CompanyStatus) }, [searchParams])
  useEffect(() => { setSearchParams((current) => { const next = new URLSearchParams(current); if (debouncedQuery) next.set('search', debouncedQuery); else next.delete('search'); return next }, { replace: true }) }, [debouncedQuery, setSearchParams])
  useEffect(() => setPage(1), [debouncedQuery, status, trustLevel, rejectedBefore, sort])

  const listQuery = useAdminCompanies({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    status: status === 'all' ? undefined : status,
    trustLevel: trustLevel === 'all' ? undefined : trustLevel,
    hasRejectedBefore: rejectedBefore || undefined,
    sort,
  })
  const overviewQuery = useAdminCompaniesOverview()
  const mutation = useVerifyAdminCompany(reviewAction?.company.id ?? '')
  const companies = listQuery.data?.data ?? []
  const total = listQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const overview = overviewQuery.data
  const hasActiveFilters = Boolean(query.trim() || status !== 'all' || trustLevel !== 'all' || rejectedBefore || sort !== 'latest')

  const completeReview = (reason?: string) => {
    if (!reviewAction) return
    mutation.mutate(
      reviewAction.type === 'approve' ? { action: 'APPROVE' } : { action: 'REJECT', reason: reason ?? '' },
      {
        onSuccess: () => {
          toast.success(content.feedback.actionSuccess)
          setReviewAction(null)
        },
        onError: (error) => toast.error(`${content.feedback.actionError} (${getApiErrorCode(error)})`),
      },
    )
  }

  if (listQuery.isPending || overviewQuery.isPending) return <div className="admin-companies-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={10} /></div>
  if ((listQuery.isError && !listQuery.data) || overviewQuery.isError || !overview) return <div className="admin-companies-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void Promise.all([listQuery.refetch(), overviewQuery.refetch()])} title={content.feedback.errorTitle} /></div>

  const handlers = {
    onApprove: (company: AdminCompany) => setReviewAction({ company, type: 'approve' as const }),
    onReject: (company: AdminCompany) => setReviewAction({ company, type: 'reject' as const }),
  }

  return <div className="admin-companies-page">
    <header className="admin-companies-page__header"><p className="admin-users-page__subtitle">{content.pageSubtitle}</p></header>
    <div className="admin-users-stats admin-companies-stats">
      <AdminStatCard icon={<MetricIcon>⌛</MetricIcon>} label={content.stats.pendingLabel} tone="amber" value={overview.byStatus.PENDING} />
      <AdminStatCard icon={<MetricIcon>✓</MetricIcon>} label={content.stats.approvedLabel} tone="blue" value={overview.byStatus.APPROVED} />
      <AdminStatCard icon={<MetricIcon>×</MetricIcon>} label={content.stats.rejectedLabel} tone="coral" value={overview.byStatus.REJECTED} />
      <AdminStatCard icon={<MetricIcon>Ⅱ</MetricIcon>} label={content.stats.suspendedLabel} tone="violet" value={overview.byStatus.SUSPENDED} />
    </div>
    <CompanyReviewFilters content={content.filters} hasActiveFilters={hasActiveFilters} isSearching={listQuery.isFetching} onClear={() => { setQuery(''); setStatus('all'); setTrustLevel('all'); setRejectedBefore(false); setSort('latest') }} onQueryChange={setQuery} onRejectedBeforeChange={setRejectedBefore} onSortChange={setSort} onStatusChange={setStatus} onTrustLevelChange={setTrustLevel} query={query} rejectedBefore={rejectedBefore} sort={sort} status={status} statusesLabel={content.statuses} trustLevel={trustLevel} trustLevelsLabel={content.trustLevels} />
    {listQuery.error ? <div className="admin-users-search-error" role="alert"><span>{content.feedback.errorDescription}</span><button onClick={() => void listQuery.refetch()} type="button">{content.feedback.retry}</button></div> : null}
    <div className="admin-users-results admin-companies-results">
      <header className="admin-users-results__header"><p className="admin-users-results__count">{content.results.countLabel.replace('{{count}}', String(total))}</p></header>
      {companies.length === 0 ? <div className="admin-users-empty"><p className="admin-users-empty__title">{content.results.emptyTitle}</p><p className="admin-users-empty__description">{content.results.emptyDescription}</p></div> : <><CompanyReviewTable actions={content.results.actions} columns={content.results.columns} companies={companies} handlers={handlers} statusesLabel={content.statuses} trustLevelsLabel={content.trustLevels} /><CompanyReviewMobileList actions={content.results.actions} columns={content.results.columns} companies={companies} handlers={handlers} statusesLabel={content.statuses} trustLevelsLabel={content.trustLevels} /></>}
    </div>
    <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />
    <ConfirmModal cancelLabel={content.actions.cancel} confirmLabel={content.results.actions.approve} description={reviewAction ? content.actions.approveDescription.replace('{{name}}', reviewAction.company.name) : ''} isOpen={reviewAction?.type === 'approve'} isPending={mutation.isPending} onCancel={() => setReviewAction(null)} onConfirm={() => completeReview()} title={content.actions.approveTitle} />
    <ReasonModal cancelLabel={content.actions.cancel} confirmLabel={content.results.actions.reject} description={reviewAction ? content.actions.rejectDescription.replace('{{name}}', reviewAction.company.name) : undefined} inputLabel={content.actions.reasonLabel} isOpen={reviewAction?.type === 'reject'} isPending={mutation.isPending} onCancel={() => setReviewAction(null)} onConfirm={completeReview} placeholder={content.actions.reasonPlaceholder} requiredMessage={content.actions.reasonRequired} title={content.actions.rejectTitle} />
  </div>
}

export default AdminCompaniesPage
