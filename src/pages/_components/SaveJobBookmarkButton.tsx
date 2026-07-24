import { Link } from 'react-router-dom'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { useToggleSavedJob } from '../../hooks/useToggleSavedJob'

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
  const { isAuthenticated, loginHref } = useAuthGuard()
  const { isSaved, pending, toggle } = useToggleSavedJob(jobId)

  if (!isAuthenticated) {
    return (
      <Link
        aria-label={labels.loginAriaLabel}
        className={`save-job-bookmark save-job-bookmark-idle ${className ?? ''}`}
        to={loginHref}
      >
        <BookmarkIcon filled={false} />
      </Link>
    )
  }

  const aria = isSaved ? labels.savedAriaLabel : labels.saveAriaLabel
  const stateClass = pending
    ? 'save-job-bookmark-loading'
    : isSaved
      ? 'save-job-bookmark-saved'
      : 'save-job-bookmark-idle'

  return (
    <button
      aria-label={aria}
      aria-pressed={isSaved}
      className={`save-job-bookmark ${stateClass} ${className ?? ''}`}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void toggle()
      }}
      type="button"
    >
      {pending ? <LoadingIcon /> : <BookmarkIcon filled={isSaved} />}
    </button>
  )
}
