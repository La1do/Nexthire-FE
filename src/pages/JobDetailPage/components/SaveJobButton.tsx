import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { JobDetailTranslations } from '../../../i18n/types'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import { useToggleSavedJob } from '../../../hooks/useToggleSavedJob'
import { useTranslations } from '../../../i18n'

type SaveJobButtonProps = {
  content: JobDetailTranslations['sidebar']
  jobId: string
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

export function SaveJobButton({ jobId }: SaveJobButtonProps) {
  const { common } = useTranslations()
  const { canSaveJobs, isAuthenticated, loginHref } = useAuthGuard()
  const { isSaved, pending, errorCode, toggle } = useToggleSavedJob(jobId)

  if (!isAuthenticated) {
    return (
      <div className="job-detail-save-block">
        <Link className="save-job-bookmark job-detail-save-cta" to={loginHref}>
          <span className="save-job-bookmark__icon">
            <Heart size={16} fill="none" />
          </span>
          <span>Lưu tin</span>
        </Link>
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
            <Heart size={16} fill="none" />
          </span>
          <span>Lưu tin</span>
        </button>
      </div>
    )
  }

  const notPublic = errorCode === 'JOB.JOB_NOT_PUBLIC'
  const buttonLabel = pending ? 'Đang lưu...' : isSaved ? 'Đã lưu tin' : 'Lưu tin'
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
        title={buttonLabel}
        type="button"
      >
        <span className="save-job-bookmark__icon">
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </span>
        <span>{buttonLabel}</span>
        {pending ? <LoadingIcon /> : null}
        {errorCode ? <span aria-hidden="true" className="save-job-bookmark__error-mark">!</span> : null}
      </button>
    </div>
  )
}
