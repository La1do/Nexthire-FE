import { ApproveIcon, CloseIcon, RejectIcon, RestoreIcon, SuspendIcon, ViewIcon } from '../../../assets/icons/admin'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow, PendingAdminJobAction } from '../types'
import { isAdminJobRevision } from '../types'

type Props = {
  actions: AdminJobsTranslations['actions']; item: AdminJobRow
  onAction: (action: PendingAdminJobAction['action'], item: AdminJobRow, revision: boolean) => void
  onView: (item: AdminJobRow) => void
}

export function AdminJobActions({ actions, item, onAction, onView }: Props) {
  const revision = isAdminJobRevision(item)
  const reviewable = ['PENDING_REVIEW', 'NEEDS_REVIEW', 'SHOULD_REJECT'].includes(item.status)
  return <div className="admin-job-actions">
    <button aria-label={actions.view} className="admin-company-action admin-company-action--ghost" onClick={() => onView(item)} title={actions.view} type="button"><ViewIcon /><span>{actions.view}</span></button>
    {reviewable ? <><button aria-label={actions.approve} className="admin-company-action admin-company-action--approve admin-action--compactable" onClick={() => onAction('approve', item, revision)} title={actions.approve} type="button"><ApproveIcon /><span>{actions.approve}</span></button><button aria-label={actions.reject} className="admin-company-action admin-company-action--reject admin-action--compactable" onClick={() => onAction('reject', item, revision)} title={actions.reject} type="button"><RejectIcon /><span>{actions.reject}</span></button></> : null}
    {!revision && item.status === 'PUBLISHED' ? <button aria-label={actions.unpublish} className="admin-company-action admin-job-action--warning admin-action--compactable" onClick={() => onAction('unpublish', item, false)} title={actions.unpublish} type="button"><SuspendIcon /><span>{actions.unpublish}</span></button> : null}
    {!revision && item.status === 'UNPUBLISHED' ? <button aria-label={actions.republish} className="admin-company-action admin-company-action--approve admin-action--compactable" onClick={() => onAction('republish', item, false)} title={actions.republish} type="button"><RestoreIcon /><span>{actions.republish}</span></button> : null}
    {!revision && ['PUBLISHED', 'UNPUBLISHED'].includes(item.status) ? <button aria-label={actions.close} className="admin-company-action admin-company-action--reject admin-action--compactable" onClick={() => onAction('close', item, false)} title={actions.close} type="button"><CloseIcon /><span>{actions.close}</span></button> : null}
  </div>
}
