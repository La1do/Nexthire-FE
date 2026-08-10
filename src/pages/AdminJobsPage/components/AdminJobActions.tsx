import { ApproveIcon, CloseIcon, RejectIcon, RestoreIcon, SuspendIcon, ViewIcon } from '../../../assets/icons/admin'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow, PendingAdminJobAction } from '../types'
import { isAdminJobRevision } from '../types'
import { AdminActionMenu } from '../../_components/admin/AdminActionMenu'

type Props = {
  actions: AdminJobsTranslations['actions']; item: AdminJobRow
  onAction: (action: PendingAdminJobAction['action'], item: AdminJobRow, revision: boolean) => void
  onView: (item: AdminJobRow) => void
}

export function AdminJobActions({ actions, item, onAction, onView }: Props) {
  const revision = isAdminJobRevision(item)
  const reviewable = ['PENDING_REVIEW', 'NEEDS_REVIEW', 'SHOULD_REJECT'].includes(item.status)
  return <div className="admin-job-actions"><AdminActionMenu label={actions.view} items={[
    { icon: <ViewIcon />, label: actions.view, onClick: () => onView(item) },
    ...(reviewable ? [{ icon: <ApproveIcon />, label: actions.approve, onClick: () => onAction('approve', item, revision), tone: 'success' as const }, { icon: <RejectIcon />, label: actions.reject, onClick: () => onAction('reject', item, revision), tone: 'danger' as const }] : []),
    ...(!revision && item.status === 'PUBLISHED' ? [{ icon: <SuspendIcon />, label: actions.unpublish, onClick: () => onAction('unpublish', item, false), tone: 'warning' as const }] : []),
    ...(!revision && item.status === 'UNPUBLISHED' ? [{ icon: <RestoreIcon />, label: actions.republish, onClick: () => onAction('republish', item, false), tone: 'success' as const }] : []),
    ...(!revision && ['PUBLISHED', 'UNPUBLISHED'].includes(item.status) ? [{ icon: <CloseIcon />, label: actions.close, onClick: () => onAction('close', item, false), tone: 'danger' as const }] : []),
  ]} /></div>
}
