import { Link } from 'react-router-dom'
import type { JobDetailTranslations } from '../../../i18n/types'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { useToggleSavedJob } from '../../../hooks/useToggleSavedJob'

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

export function SaveJobButton({ content, jobId }: SaveJobButtonProps) {
  const { isAuthenticated, loginHref } = useAuthGuard()
  const { isSaved, pending, errorCode, toggle } = useToggleSavedJob(jobId)

  if (!isAuthenticated) {
    return (
      <div className="job-detail-save-block">
        <Link className="job-detail-save-cta" to={loginHref}>
          {content.save}
        </Link>
        <p className="job-detail-save-hint">{content.loginHint}</p>
      </div>
    )
  }

  const notPublic = errorCode === 'JOB.JOB_NOT_PUBLIC'

  return (
    <div className="job-detail-save-block">
      <button
        aria-pressed={isSaved}
        className={`job-detail-save-cta${isSaved ? ' is-saved' : ''}`}
        disabled={pending || notPublic}
        onClick={() => void toggle()}
        type="button"
      >
        <BookmarkIcon filled={isSaved} />
        <span>{isSaved ? content.saved : content.save}</span>
      </button>

      {notPublic ? <p className="job-detail-save-hint">{content.jobNotPublic}</p> : null}

      {errorCode && errorCode !== 'JOB.JOB_NOT_PUBLIC' ? (
        <p className="job-detail-save-hint">{content.saveError}</p>
      ) : null}
    </div>
  )
}
