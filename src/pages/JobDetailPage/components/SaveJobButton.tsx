import { Link } from 'react-router-dom'
import type { JobDetailTranslations } from '../../../i18n/types'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { useToggleSavedJob } from '../../../hooks/useToggleSavedJob'
import { useTranslations } from '../../../i18n'

type SaveJobButtonProps = {
  content: JobDetailTranslations['sidebar']
  jobId: string
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
    </svg>
  )
}

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="save-job-bookmark-spin"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </svg>
  )
}

export function SaveJobButton({ content, jobId }: SaveJobButtonProps) {
  const { common } = useTranslations()
  const { canSaveJobs, isAuthenticated, loginHref } = useAuthGuard()
  const { isSaved, pending, errorCode, toggle } = useToggleSavedJob(jobId)

  if (!isAuthenticated) {
    return (
      <div className="job-detail-save-block">
        <Link className="save-job-bookmark job-detail-save-cta" to={loginHref}>
          <span className="save-job-bookmark__icon">
            <BookmarkIcon filled={false} />
          </span>
          <span>{content.save}</span>
        </Link>
        <p className="job-detail-save-hint">{content.loginHint}</p>
      </div>
    )
  }

  if (!canSaveJobs) {
    return (
      <div className="job-detail-save-block">
        <button
          className="save-job-bookmark save-job-bookmark-disabled job-detail-save-cta"
          disabled
          title={common.savedJobs.candidateOnly}
          type="button"
        >
          <span className="save-job-bookmark__icon">
            <BookmarkIcon filled={false} />
          </span>
          <span>{content.save}</span>
        </button>
        <p className="job-detail-save-hint">{common.savedJobs.candidateOnly}</p>
      </div>
    )
  }

  const notPublic = errorCode === 'JOB.JOB_NOT_PUBLIC'
  const pendingLabel = isSaved ? common.savedJobs.saving : common.savedJobs.removing
  const buttonLabel = pending ? pendingLabel : isSaved ? content.saved : content.save
  const errorMessage = notPublic
    ? content.jobNotPublic
    : errorCode
      ? content.saveError
      : ''
  const stateClass = [
    isSaved ? 'save-job-bookmark-saved is-saved' : 'save-job-bookmark-idle',
    pending ? 'save-job-bookmark-loading' : '',
    errorCode ? 'save-job-bookmark-error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="job-detail-save-block">
      <button
        aria-busy={pending}
        aria-label={buttonLabel}
        aria-pressed={isSaved}
        className={`save-job-bookmark job-detail-save-cta ${stateClass}`}
        disabled={pending || notPublic}
        onClick={() => void toggle()}
        title={errorCode ? common.savedJobs.saveError : buttonLabel}
        type="button"
      >
        <span className="save-job-bookmark__icon">
          <BookmarkIcon filled={isSaved} />
        </span>
        <span>{buttonLabel}</span>
        {pending ? <LoadingIcon /> : null}
        {errorCode ? <span aria-hidden="true" className="save-job-bookmark__error-mark">!</span> : null}
      </button>

      <p aria-live="assertive" className="job-detail-save-hint">{errorMessage}</p>
    </div>
  )
}
