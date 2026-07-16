import { useEffect, useMemo, useState } from 'react'
import { getTranslations } from '../../i18n'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { CompanyReviewFilters } from './components/CompanyReviewFilters'
import { CompanyReviewMobileList } from './components/CompanyReviewMobileList'
import { CompanyReviewTable } from './components/CompanyReviewTable'
import { adminCompaniesFixture, computeCompanyStats } from './utils/adminCompaniesData'
import { filterAdminCompanies, isActiveCompanyFilters } from './utils/adminCompaniesFilters'
import type { AdminCompany, CompanyReviewStatus } from './types'

const PAGE_SIZE = 6

function PendingIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function ApprovedIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function RejectedIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M15 9 9 15" />
      <path d="m9 9 6 6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function AdminCompaniesPage() {
  const { pages } = getTranslations()
  const content = pages.adminCompanies

  const [companies, setCompanies] = useState<ReadonlyArray<AdminCompany>>(() => [...adminCompaniesFixture])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CompanyReviewStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const stats = useMemo(() => computeCompanyStats(companies), [companies])

  const filtered = useMemo(
    () => filterAdminCompanies(companies, { query, status }),
    [companies, query, status],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [query, status])

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function updateCompanyStatus(company: AdminCompany, nextStatus: CompanyReviewStatus) {
    setCompanies((current) =>
      current.map((item) => (item.id === company.id ? { ...item, status: nextStatus } : item)),
    )
  }

  const activeFilters = isActiveCompanyFilters({ query, status })

  return (
    <div className="admin-companies-page">
      <header className="admin-companies-page__header">
        <p className="admin-users-page__subtitle">{content.pageSubtitle}</p>
      </header>

      <div className="admin-users-stats admin-companies-stats">
        <AdminStatCard
          delta={content.stats.pendingDelta}
          icon={<PendingIcon />}
          label={content.stats.pendingLabel}
          tone="amber"
          value={stats.pending}
        />
        <AdminStatCard
          delta={content.stats.approvedDelta}
          icon={<ApprovedIcon />}
          label={content.stats.approvedLabel}
          tone="blue"
          value={stats.approved}
        />
        <AdminStatCard
          delta={content.stats.rejectedDelta}
          icon={<RejectedIcon />}
          label={content.stats.rejectedLabel}
          tone="coral"
          value={stats.rejected}
        />
      </div>

      <CompanyReviewFilters
        content={content.filters}
        hasActiveFilters={activeFilters}
        onClear={() => {
          setQuery('')
          setStatus('all')
        }}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        query={query}
        status={status}
        statusesLabel={content.statuses}
      />

      <div className="admin-users-results admin-companies-results">
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
            <CompanyReviewTable
              actions={content.results.actions}
              columns={content.results.columns}
              companies={paged}
              handlers={{
                onApprove: (company) => updateCompanyStatus(company, 'approved'),
                onReject: (company) => updateCompanyStatus(company, 'rejected'),
              }}
              statusesLabel={content.statuses}
            />
            <CompanyReviewMobileList
              actions={content.results.actions}
              columns={content.results.columns}
              companies={paged}
              handlers={{
                onApprove: (company) => updateCompanyStatus(company, 'approved'),
                onReject: (company) => updateCompanyStatus(company, 'rejected'),
              }}
              statusesLabel={content.statuses}
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

export default AdminCompaniesPage
