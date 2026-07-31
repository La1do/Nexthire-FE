import type {
  AdminCompanyListQuery,
  AdminDashboardGrowthQuery,
  AdminJobListQuery,
  AdminJobReviewQueueQuery,
  AdminRevisionReviewQueueQuery,
  AdminUserListQuery,
} from '../services/admin'

export const adminQueryKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminQueryKeys.all, 'dashboard'] as const,
  dashboardOverview: () => [...adminQueryKeys.dashboard(), 'overview'] as const,
  dashboardGrowth: () => [...adminQueryKeys.dashboard(), 'growth'] as const,
  dashboardGrowthSeries: (query: AdminDashboardGrowthQuery) =>
    [...adminQueryKeys.dashboardGrowth(), 'series', query] as const,
  dashboardUserGrowth: (query: AdminDashboardGrowthQuery) =>
    [...adminQueryKeys.dashboardGrowth(), 'users', query] as const,
  dashboardCompanyGrowth: (query: AdminDashboardGrowthQuery) =>
    [...adminQueryKeys.dashboardGrowth(), 'companies', query] as const,
  dashboardJobGrowth: (query: AdminDashboardGrowthQuery) =>
    [...adminQueryKeys.dashboardGrowth(), 'jobs', query] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  userLists: () => [...adminQueryKeys.users(), 'list'] as const,
  userList: (query: AdminUserListQuery) => [...adminQueryKeys.userLists(), query] as const,
  userDetails: () => [...adminQueryKeys.users(), 'detail'] as const,
  userDetail: (userId: string) => [...adminQueryKeys.userDetails(), userId] as const,
  companies: () => [...adminQueryKeys.all, 'companies'] as const,
  companyLists: () => [...adminQueryKeys.companies(), 'list'] as const,
  companyList: (query: AdminCompanyListQuery) =>
    [...adminQueryKeys.companyLists(), query] as const,
  pendingCompanies: () => [...adminQueryKeys.companies(), 'pending'] as const,
  companyDocuments: (companyId: string) =>
    [...adminQueryKeys.companies(), companyId, 'documents'] as const,
  companyTrustHistory: (companyId: string) =>
    [...adminQueryKeys.companies(), companyId, 'trust-history'] as const,
  jobs: () => [...adminQueryKeys.all, 'jobs'] as const,
  jobLists: () => [...adminQueryKeys.jobs(), 'list'] as const,
  jobList: (query: AdminJobListQuery) => [...adminQueryKeys.jobLists(), query] as const,
  jobReviewQueues: () => [...adminQueryKeys.jobs(), 'review-queue'] as const,
  jobReviewQueue: (query: AdminJobReviewQueueQuery) =>
    [...adminQueryKeys.jobReviewQueues(), query] as const,
  revisionReviewQueues: () => [...adminQueryKeys.jobs(), 'revision-review-queue'] as const,
  revisionReviewQueue: (query: AdminRevisionReviewQueueQuery) =>
    [...adminQueryKeys.revisionReviewQueues(), query] as const,
}
