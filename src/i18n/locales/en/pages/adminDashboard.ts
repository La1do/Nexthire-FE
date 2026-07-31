import type { AdminDashboardTranslations } from '../../../types'

export const adminDashboard: AdminDashboardTranslations = {
  routeLabel: 'Admin overview',
  pageTitle: 'Admin overview',
  subtitle: 'Monitor users, companies, and moderation activity across the platform.',
  loadingLabel: 'Loading dashboard overview',
  header: {
    lastUpdated: 'Updated at',
    refresh: 'Refresh',
    refreshing: 'Refreshing',
  },
  growth: {
    title: 'User growth',
    description: 'Track the user base and new accounts over time.',
    demoBadge: 'Demo data',
    comparisonLabel: 'Compared with the previous period',
    unavailableLabel: 'Not comparable yet',
    totalUsers: 'Total users',
    newUsers: 'New users',
    periods: {
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
    },
  },
  error: {
    title: 'Unable to load the overview',
    description: 'Admin data is currently unavailable. Please try again.',
    retry: 'Try again',
  },
  empty: {
    title: 'No system data yet',
    description: 'Metrics will appear when the platform has users, companies, or jobs.',
  },
  stats: {
    users: 'Total users',
    pendingCompanies: 'Companies pending review',
    pendingJobs: 'Jobs pending review',
    pendingRevisions: 'Revisions pending review',
  },
  charts: {
    usersByRole: 'Users by role',
    companiesByStatus: 'Companies by status',
    jobsByStatus: 'Jobs by status',
    noData: 'No data yet',
  },
  roles: {
    CANDIDATE: 'Candidates',
    RECRUITER: 'Recruiters',
    ADMIN: 'Administrators',
  },
  companyStatuses: {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SUSPENDED: 'Suspended',
  },
  jobStatuses: {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending review',
    NEEDS_REVIEW: 'Needs review',
    SHOULD_REJECT: 'Suggested rejection',
    PUBLISHED: 'Published',
    UNPUBLISHED: 'Unpublished',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
    ARCHIVED: 'Archived',
  },
  queues: {
    title: 'Queues requiring attention',
    description: 'Jump directly to items that need an administrator review.',
    companies: 'Companies pending verification',
    jobs: 'Jobs pending moderation',
    revisions: 'Revisions pending moderation',
    action: 'View list',
  },
}
