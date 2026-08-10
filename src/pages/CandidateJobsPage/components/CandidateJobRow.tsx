import type { ProfileTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import { initials, pickTone } from '../../_utils/jobFormat'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../../_utils/jobRoutes'
import type { CandidateManagedJob } from '../types'

type CandidateJobRowProps = {
  content: ProfileTranslations['managedJobs']
  formatDate: (value: string | null | undefined) => string
  isRemovingSavedJob: boolean
  job: CandidateManagedJob
  onRemoveSavedJob: (jobId: string) => Promise<void>
}

const unavailableStatuses = new Set(['UNPUBLISHED', 'CLOSED', 'EXPIRED', 'REJECTED'])

function canApplyToJob(job: CandidateManagedJob) {
  return !job.isApplied && !unavailableStatuses.has(job.jobStatus ?? '')
}

function getStatusBadges(job: CandidateManagedJob, content: ProfileTranslations['managedJobs']) {
  const badges: Array<{ key: string; label: string; tone: string }> = []

  if (job.isSaved) {
    badges.push({ key: 'saved', label: content.statusLabels.saved, tone: 'saved' })
  }

  if (job.applicationStatus) {
    badges.push({
      key: job.applicationStatus,
      label: content.statusLabels[job.applicationStatus],
      tone: job.applicationStatus.toLowerCase(),
    })
  } else if (job.jobStatus && job.jobStatus !== 'PUBLISHED') {
    badges.push({
      key: job.jobStatus,
      label: content.statusLabels[job.jobStatus],
      tone: job.jobStatus.toLowerCase(),
    })
  }

  if (job.needsAttention) {
    badges.push({ key: 'attention', label: content.statusLabels.needsAttention, tone: 'attention' })
  }

  return badges
}

export function CandidateJobRow({
  content,
  formatDate,
  isRemovingSavedJob,
  job,
  onRemoveSavedJob,
}: CandidateJobRowProps) {
  const companyHref = job.companyId ? createCompanyDetailHrefById(job.companyId) : undefined
  const statusBadges = getStatusBadges(job, content)
  const deadlineLabel = job.deadline ? formatDate(job.deadline) : content.meta.noDeadline
  const savedAtLabel = job.savedAt ? formatDate(job.savedAt) : content.meta.notAvailable
  const appliedAtLabel = job.appliedAt ? formatDate(job.appliedAt) : content.meta.notAvailable
  const shouldShowApply = canApplyToJob(job)

  return (
    <article className="candidate-job-row">
      <a
        aria-label={job.companyName}
        className="candidate-job-logo"
        href={companyHref ?? createJobDetailHrefById(job.jobId)}
      >
        <CompanyLogoMark
          alt={`${job.companyName} logo`}
          fallbackText={initials(job.companyName)}
          src={job.companyLogoUrl ?? ''}
          tone={pickTone(job.companyId ?? job.companyName)}
        />
      </a>

      <div className="candidate-job-main">
        <div className="candidate-job-title-line">
          <div>
            <h2>
              <a href={createJobDetailHrefById(job.jobId)}>{job.title}</a>
            </h2>
            <p>{job.companyName}</p>
          </div>
          <div className="candidate-job-badges">
            {statusBadges.map((badge) => (
              <span className={`candidate-job-badge candidate-job-badge--${badge.tone}`} key={badge.key}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        <dl className="candidate-job-meta">
          <div>
            <dt>{content.meta.location}</dt>
            <dd>{job.location}</dd>
          </div>
          <div>
            <dt>{content.meta.salary}</dt>
            <dd>{job.salaryLabel}</dd>
          </div>
          <div>
            <dt>{content.meta.deadline}</dt>
            <dd>{deadlineLabel}</dd>
          </div>
        </dl>
      </div>

      <dl className="candidate-job-dates">
        {job.isSaved ? (
          <div>
            <dt>{content.meta.savedAt}</dt>
            <dd>{savedAtLabel}</dd>
          </div>
        ) : null}
        {job.isApplied ? (
          <div>
            <dt>{content.meta.appliedAt}</dt>
            <dd>{appliedAtLabel}</dd>
          </div>
        ) : null}
      </dl>

      <div className="candidate-job-actions">
        <a className="candidate-job-action-primary" href={createJobDetailHrefById(job.jobId)}>
          {content.actions.viewJob}
        </a>
        {shouldShowApply ? (
          <a className="candidate-job-action-secondary" href={createJobDetailHrefById(job.jobId)}>
            {content.actions.apply}
          </a>
        ) : null}
        {job.isApplied ? (
          <a className="candidate-job-action-secondary" href="/profile/applications">
            {content.actions.viewApplication}
          </a>
        ) : null}
        {job.isSaved ? (
          <button
            className="candidate-job-action-ghost"
            disabled={isRemovingSavedJob}
            onClick={() => void onRemoveSavedJob(job.jobId)}
            type="button"
          >
            {isRemovingSavedJob ? content.actions.removingSaved : content.actions.removeSaved}
          </button>
        ) : null}
      </div>
    </article>
  )
}
