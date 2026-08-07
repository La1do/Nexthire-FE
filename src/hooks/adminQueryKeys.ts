import type {
  AdminCompanyListQuery,
  AdminAiUsageLogQuery,
  AdminDashboardGrowthQuery,
  AdminJobListQuery,
  AdminJobReviewQueueQuery,
  AdminRevisionReviewQueueQuery,
  AdminUserListQuery,
  AdminCvTemplatePresetQuery,
} from '../services/admin'

export const adminQueryKeys = {
  all: ['admin'] as const,
  ai: () => [...adminQueryKeys.all, 'ai-management'] as const,
  aiConfig: () => [...adminQueryKeys.ai(), 'config'] as const,
  aiUsageSummary: () => [...adminQueryKeys.ai(), 'usage-summary'] as const,
  aiUsageLogs: () => [...adminQueryKeys.ai(), 'usage-logs'] as const,
  aiUsageLogList: (query: AdminAiUsageLogQuery) => [...adminQueryKeys.aiUsageLogs(), query] as const,
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
  companyOverview: () => [...adminQueryKeys.companies(), 'overview'] as const,
  companyLists: () => [...adminQueryKeys.companies(), 'list'] as const,
  companyList: (query: AdminCompanyListQuery) =>
    [...adminQueryKeys.companyLists(), query] as const,
  pendingCompanies: () => [...adminQueryKeys.companies(), 'pending'] as const,
  companyDocuments: (companyId: string) =>
    [...adminQueryKeys.companies(), companyId, 'documents'] as const,
  companyTrustHistory: (companyId: string) =>
    [...adminQueryKeys.companies(), companyId, 'trust-history'] as const,
  cvTemplatePresets: () => [...adminQueryKeys.all, 'cv-template-presets'] as const,
  cvTemplatePresetLists: () => [...adminQueryKeys.cvTemplatePresets(), 'list'] as const,
  cvTemplatePresetList: (query: AdminCvTemplatePresetQuery) =>
    [...adminQueryKeys.cvTemplatePresetLists(), query] as const,
  cvTemplatePresetDetails: () => [...adminQueryKeys.cvTemplatePresets(), 'detail'] as const,
  cvTemplatePresetDetail: (presetId: string) =>
    [...adminQueryKeys.cvTemplatePresetDetails(), presetId] as const,
  cvTemplateDesigns: () => [...adminQueryKeys.all, 'cv-template-designs'] as const,
  cvTemplateDesign: (jobId: string) =>
    [...adminQueryKeys.cvTemplateDesigns(), jobId] as const,
  jobs: () => [...adminQueryKeys.all, 'jobs'] as const,
  jobLists: () => [...adminQueryKeys.jobs(), 'list'] as const,
  jobList: (query: AdminJobListQuery) => [...adminQueryKeys.jobLists(), query] as const,
  jobReviewQueues: () => [...adminQueryKeys.jobs(), 'review-queue'] as const,
  jobReviewQueue: (query: AdminJobReviewQueueQuery) =>
    [...adminQueryKeys.jobReviewQueues(), query] as const,
  jobDetails: () => [...adminQueryKeys.jobs(), 'detail'] as const,
  jobDetail: (jobId: string) => [...adminQueryKeys.jobDetails(), jobId] as const,
  revisionReviewQueues: () => [...adminQueryKeys.jobs(), 'revision-review-queue'] as const,
  revisionReviewQueue: (query: AdminRevisionReviewQueueQuery) =>
    [...adminQueryKeys.revisionReviewQueues(), query] as const,
  revisionDetails: () => [...adminQueryKeys.jobs(), 'revision-detail'] as const,
  revisionDetail: (revisionId: string) => [...adminQueryKeys.revisionDetails(), revisionId] as const,
  notifications: () => [...adminQueryKeys.all, 'notifications'] as const,
  notificationList: () => [...adminQueryKeys.notifications(), 'list'] as const,
  notificationUnread: () => [...adminQueryKeys.notifications(), 'unread'] as const,
}
