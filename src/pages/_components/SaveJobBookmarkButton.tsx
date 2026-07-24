import { Link } from 'react-router-dom'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { useToggleSavedJob } from '../../hooks/useToggleSavedJob'
import { useTranslations } from '../../i18n'

type SaveJobBookmarkButtonProps = {
  className?: string
  jobId: string
  labels: {
    loginAriaLabel: string
    savedAriaLabel: string
    saveAriaLabel: string
  }
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

export function SaveJobBookmarkButton({ className, jobId, labels }: SaveJobBookmarkButtonProps) {
  const { common } = useTranslations()
  const { canSaveJobs, isAuthenticated, loginHref } = useAuthGuard()
  const { isSaved, pending, errorCode, toggle } = useToggleSavedJob(jobId)

  if (!isAuthenticated) {
    return (
      <Link
        aria-label={labels.loginAriaLabel}
        className={`save-job-bookmark save-job-bookmark-idle ${className ?? ''}`}
        to={loginHref}
      >
        <span className="save-job-bookmark__icon">
          <BookmarkIcon filled={false} />
        </span>
      </Link>
    )
  }

  if (!canSaveJobs) {
    return (
      <button
        aria-label={common.savedJobs.candidateOnly}
        className={`save-job-bookmark save-job-bookmark-disabled ${className ?? ''}`}
        disabled
        title={common.savedJobs.candidateOnly}
        type="button"
      >
        <span className="save-job-bookmark__icon">
          <BookmarkIcon filled={false} />
        </span>
      </button>
    )
  }

  const pendingLabel = isSaved ? common.savedJobs.saving : common.savedJobs.removing
  const removeLabel = labels.savedAriaLabel === labels.saveAriaLabel
    ? common.savedJobs.remove
    : labels.savedAriaLabel
  const aria = pending ? pendingLabel : isSaved ? removeLabel : labels.saveAriaLabel
  const stateClass = [
    isSaved ? 'save-job-bookmark-saved' : 'save-job-bookmark-idle',
    pending ? 'save-job-bookmark-loading' : '',
    errorCode ? 'save-job-bookmark-error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-busy={pending}
      aria-label={aria}
      aria-pressed={isSaved}
      className={`save-job-bookmark ${stateClass} ${className ?? ''}`}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void toggle()
      }}
      title={errorCode ? common.savedJobs.saveError : aria}
      type="button"
    >
      <span className="save-job-bookmark__icon">
        <BookmarkIcon filled={isSaved} />
      </span>
      {pending ? <LoadingIcon /> : null}
      {errorCode ? (
        <>
          <span aria-hidden="true" className="save-job-bookmark__error-mark">!</span>
          <span aria-live="assertive" className="sr-only">{common.savedJobs.saveError}</span>
        </>
      ) : null}
    </button>
  )
}
