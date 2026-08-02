import type { AdminJobsTranslations } from '../../../types'

export const adminJobs: AdminJobsTranslations = {
  routeLabel: 'Admin — Jobs', pageTitle: 'Job moderation', pageSubtitle: 'Review content, risk signals, and moderation queues.',
  tabs: { all: 'All jobs', review: 'Review queue', revisions: 'Revision queue' },
  stats: { total: 'Total jobs', review: 'Waiting for review', published: 'Published', revisions: 'Revisions waiting' },
  filters: { searchLabel: 'Search', searchPlaceholder: 'Title, company, location, or skill', statusLabel: 'Status', statusAll: 'All statuses', riskLabel: 'Risk level', riskAll: 'All risk levels', companyLabel: 'Company', companyAll: 'All companies', sortLabel: 'Sort', clear: 'Clear filters' },
  columns: { job: 'Job', company: 'Company', status: 'Status', risk: 'Risk', applications: 'Applications', updated: 'Updated', actions: 'Actions' },
  statuses: { DRAFT: 'Draft', PENDING_REVIEW: 'Pending review', NEEDS_REVIEW: 'Needs review', SHOULD_REJECT: 'Suggested rejection', PUBLISHED: 'Published', UNPUBLISHED: 'Unpublished', REJECTED: 'Rejected', CLOSED: 'Closed', EXPIRED: 'Expired', APPROVED: 'Approved', CANCELLED: 'Cancelled' },
  risks: { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical', NONE: 'Not assessed' },
  sorts: { latest: 'Newest', oldest: 'Oldest', risk: 'Highest risk', applications: 'Most applications' },
  detail: { title: 'Moderation details', description: 'Job description', requirements: 'Requirements', benefits: 'Benefits', skills: 'Skills', moderation: 'Moderation analysis', reasons: 'Warning reasons', rules: 'Matched rules', changeSummary: 'Change summary', noData: 'No data', close: 'Close' },
  actions: { view: 'View details', approve: 'Approve', reject: 'Reject', unpublish: 'Unpublish', republish: 'Republish', close: 'Close job', cancel: 'Cancel', confirmTitle: 'Confirm action', confirmDescription: 'Are you sure you want to {{action}} “{{title}}”?', reasonTitle: 'Enter an action reason', reasonDescription: 'Explain why you want to {{action}} “{{title}}”.', reasonLabel: 'Reason', reasonPlaceholder: 'Enter a clear reason for the recruiter and audit history...', reasonRequired: 'Reason is required.' },
  feedback: { loading: 'Loading admin jobs', errorTitle: 'Unable to load jobs', errorDescription: 'Admin job data could not be loaded.', retry: 'Retry', emptyTitle: 'No matching jobs', emptyDescription: 'Change the keyword or filters to broaden the results.', countLabel: '{{count}} jobs', actionSuccess: 'Job updated successfully.', actionError: 'The action could not be completed.' },
  pagination: { prev: 'Previous page', next: 'Next page', pageOf: 'Page {{current}} of {{total}}' },
}
