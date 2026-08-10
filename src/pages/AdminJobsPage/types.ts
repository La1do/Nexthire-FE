import type { AdminJob, AdminJobRevision } from '../../types/admin.types'

export type AdminJobsTab = 'all' | 'review' | 'revisions'
export type AdminJobRow = AdminJob | AdminJobRevision
export type AdminJobAction = 'approve' | 'reject' | 'unpublish' | 'republish' | 'close'

export type PendingAdminJobAction = {
  action: AdminJobAction
  item: AdminJobRow
  revision: boolean
}

export function isAdminJobRevision(item: AdminJobRow): item is AdminJobRevision {
  return 'jobId' in item
}
