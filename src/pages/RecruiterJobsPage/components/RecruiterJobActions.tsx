import { Button } from '../../_components'
import { Link } from 'react-router-dom'
import type { RecruiterJobsTranslations } from '../../../i18n/types'
import type { RecruiterJobResponse } from '../../../types/job.types'
import type { RecruiterJobAction, RecruiterJobActionState } from '../types'
import { getAvailableJobActions } from '../utils/recruiterJobsData'

type RecruiterJobActionsProps = {
  actionState: RecruiterJobActionState
  editHref?: string
  job: RecruiterJobResponse
  onAction: (job: RecruiterJobResponse, action: RecruiterJobAction) => void
  translations: RecruiterJobsTranslations
}

const ACTION_LOADING_LABELS: Record<RecruiterJobAction, keyof RecruiterJobsTranslations['actions']> = {
  close: 'closing',
  delete: 'deleting',
  republish: 'republishing',
  submit: 'submitting',
  unpublish: 'unpublishing',
}

const ACTION_LABELS: Record<RecruiterJobAction, keyof RecruiterJobsTranslations['actions']> = {
  close: 'close',
  delete: 'delete',
  republish: 'republish',
  submit: 'submit',
  unpublish: 'unpublish',
}

export function RecruiterJobActions({
  actionState,
  editHref,
  job,
  onAction,
  translations,
}: RecruiterJobActionsProps) {
  const actions = getAvailableJobActions(job)

  const canEdit = Boolean(editHref) && (job.status === 'DRAFT' || job.status === 'PUBLISHED')

  if (!actions.length && !canEdit) {
    return <span className="recruiter-job-actions-empty">{translations.actions.none}</span>
  }

  return (
    <div className="recruiter-job-actions">
      {canEdit && editHref ? (
        <Link
          className="recruiter-job-edit-link recruiter-job-action"
          onClick={(event) => event.stopPropagation()}
          to={editHref}
        >
          {translations.actions.edit}
        </Link>
      ) : null}
      {actions.map((action) => {
        const isLoading = actionState?.jobId === job.id && actionState.action === action
        const label = isLoading
          ? translations.actions[ACTION_LOADING_LABELS[action]]
          : translations.actions[ACTION_LABELS[action]]

        return (
          <Button
            className={`recruiter-job-action recruiter-job-action--${action}`}
            disabled={Boolean(actionState)}
            key={action}
            onClick={(event) => {
              event.stopPropagation()
              onAction(job, action)
            }}
            type="button"
            variant="secondary"
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
