import { useMemo, useState } from 'react'
import {
  useAdminDashboardOverview,
  useAdminGrowthSeries,
  useAdminUserGrowth,
} from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import type { AdminUserGrowthPeriod } from '../../types/admin.types'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { DashboardDonutChart } from './components/DashboardDonutChart'
import type { DashboardChartItem } from './components/DashboardDistributionChart'
import { DashboardGrowthChart } from './components/DashboardGrowthChart'
import { DashboardReviewQueues } from './components/DashboardReviewQueues'
import { getAdminGrowthDateRange } from './utils/adminDashboardDateRange'
import { toAdminUserGrowthChartData } from './utils/adminUserGrowthSeries'
import './admin-dashboard-page.css'

function MetricIcon({ type }: { type: 'users' | 'companies' | 'jobs' | 'revisions' }) {
  if (type === 'companies') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 21V7l8-4 8 4v14M8 10h2m4 0h2M8 14h2m4 0h2M9 21v-3h6v3" />
      </svg>
    )
  }
  if (type === 'jobs') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="14" rx="2" width="18" x="3" y="6" />
        <path d="M9 6V4h6v2m-12 6h18" />
      </svg>
    )
  }
  if (type === 'revisions') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0 0 11.5 2M18.5 9A7 7 0 0 0 7 7" />
      </svg>
    )
  }
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="17" cy="11" r="2.8" />
      <path d="M3 19a6 6 0 0 1 12 0m0 0a4 4 0 0 1 6 0" />
    </svg>
  )
}

export function AdminDashboardPage() {
  const { pages } = useTranslations()
  const content = pages.adminDashboard
  const overviewQuery = useAdminDashboardOverview()
  const overview = overviewQuery.data
  const [growthPeriod, setGrowthPeriod] = useState<AdminUserGrowthPeriod>('30d')
  const growthRange = useMemo(
    () => getAdminGrowthDateRange(growthPeriod),
    [growthPeriod],
  )
  const growthQuery = useAdminUserGrowth(growthRange)
  const growthSeriesQuery = useAdminGrowthSeries({ ...growthRange, bucket: 'day' })
  const growthChartData = useMemo(
    () =>
      toAdminUserGrowthChartData(
        growthSeriesQuery.data?.users.points ?? [],
        overview?.users.total ?? 0,
      ),
    [growthSeriesQuery.data, overview?.users.total],
  )

  const charts = useMemo(() => {
    if (!overview) {
      return null
    }

    const users: DashboardChartItem[] = Object.entries(overview.users.byRole).map(
      ([role, value]) => ({
        label: content.roles[role as keyof typeof content.roles] ?? role,
        value,
      }),
    )
    const companies: DashboardChartItem[] = Object.entries(overview.companies.byStatus).map(
      ([status, value]) => ({
        label: content.companyStatuses[status as keyof typeof content.companyStatuses] ?? status,
        value,
      }),
    )
    const jobs: DashboardChartItem[] = Object.entries(overview.jobs.jobsByStatus)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        label: content.jobStatuses[status] ?? status,
        value,
      }))

    return { users, companies, jobs }
  }, [content, overview])

  if (overviewQuery.isPending) {
    return (
      <div className="admin-users-page admin-dashboard-page">
        <header className="admin-dashboard-page__header">
          <p className="admin-users-page__subtitle">{content.subtitle}</p>
        </header>
        <div className="admin-users-stats admin-dashboard-stats">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingSkeleton ariaLabel={content.loadingLabel} key={index} lines={3} />
          ))}
        </div>
        <div className="admin-dashboard-loading-panels">
          <LoadingSkeleton ariaLabel={content.loadingLabel} lines={8} />
          <LoadingSkeleton ariaLabel={content.loadingLabel} lines={8} />
        </div>
      </div>
    )
  }

  if (overviewQuery.isError || !overview || !charts) {
    return (
      <div className="admin-users-page admin-dashboard-page">
        <ErrorState
          actionLabel={content.error.retry}
          description={content.error.description}
          onRetry={() => void overviewQuery.refetch()}
          title={content.error.title}
        />
      </div>
    )
  }

  return (
    <div className="admin-users-page admin-dashboard-page">
      <header className="admin-dashboard-page__header">
        <div>
          <p className="admin-users-page__subtitle">{content.subtitle}</p>
          <span className="admin-dashboard-page__updated">
            {content.header.lastUpdated}{' '}
            {new Intl.DateTimeFormat(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            }).format(overviewQuery.dataUpdatedAt)}
          </span>
        </div>
        <button
          className="admin-dashboard-refresh"
          disabled={
            overviewQuery.isFetching || growthQuery.isFetching || growthSeriesQuery.isFetching
          }
          onClick={() =>
            void Promise.all([
              overviewQuery.refetch(),
              growthQuery.refetch(),
              growthSeriesQuery.refetch(),
            ])
          }
          type="button"
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.2-2L20 9M4 15l2.7 2A7 7 0 0 0 18 15" />
          </svg>
          {overviewQuery.isFetching || growthQuery.isFetching || growthSeriesQuery.isFetching
            ? content.header.refreshing
            : content.header.refresh}
        </button>
      </header>

      <div className="admin-users-stats admin-dashboard-stats">
        <AdminStatCard
          icon={<MetricIcon type="users" />}
          label={content.stats.users}
          tone="blue"
          value={overview.users.total}
        />
        <AdminStatCard
          icon={<MetricIcon type="companies" />}
          label={content.stats.pendingCompanies}
          tone="violet"
          value={overview.companies.byStatus.PENDING}
        />
        <AdminStatCard
          icon={<MetricIcon type="jobs" />}
          label={content.stats.pendingJobs}
          tone="coral"
          value={overview.jobs.jobsWaitingReview}
        />
        <AdminStatCard
          icon={<MetricIcon type="revisions" />}
          label={content.stats.pendingRevisions}
          tone="amber"
          value={overview.jobs.revisionsWaitingReview}
        />
      </div>

      <div className="admin-dashboard-focus-grid">
        {growthSeriesQuery.isError ? (
          <section className="admin-dashboard-panel admin-dashboard-growth">
            <ErrorState
              actionLabel={content.error.retry}
              description={content.error.description}
              onRetry={() => void growthSeriesQuery.refetch()}
              title={content.error.title}
            />
          </section>
        ) : (
          <DashboardGrowthChart
          badgeLabel={content.growth.demoBadge}
          comparisonLabel={content.growth.comparisonLabel}
          data={growthChartData}
          description={content.growth.description}
          growthLoading={growthQuery.isPending || growthSeriesQuery.isPending}
          growthPercent={
            growthQuery.isError
              ? undefined
              : growthQuery.data?.growth.registeredUsers.percent
          }
          newUsersLabel={content.growth.newUsers}
          onPeriodChange={setGrowthPeriod}
          period={growthPeriod}
          periodLabels={content.growth.periods}
          title={content.growth.title}
          totalUsersLabel={content.growth.totalUsers}
          unavailableLabel={content.growth.unavailableLabel}
          />
        )}
        <DashboardReviewQueues
          actionLabel={content.queues.action}
          description={content.queues.description}
          queues={[
            {
              count: overview.companies.byStatus.PENDING,
              href: '/admin/companies?status=PENDING',
              label: content.queues.companies,
            },
            {
              count: overview.jobs.jobsWaitingReview,
              href: '/admin/jobs?tab=review',
              label: content.queues.jobs,
            },
            {
              count: overview.jobs.revisionsWaitingReview,
              href: '/admin/jobs?tab=revisions',
              label: content.queues.revisions,
            },
          ]}
          title={content.queues.title}
        />
      </div>

      <div className="admin-dashboard-distributions">
        <DashboardDonutChart
          data={charts.users}
          emptyLabel={content.charts.noData}
          title={content.charts.usersByRole}
        />
        <DashboardDonutChart
          data={charts.companies}
          emptyLabel={content.charts.noData}
          title={content.charts.companiesByStatus}
        />
        <DashboardDonutChart
          data={charts.jobs}
          emptyLabel={content.charts.noData}
          title={content.charts.jobsByStatus}
        />
      </div>
    </div>
  )
}
