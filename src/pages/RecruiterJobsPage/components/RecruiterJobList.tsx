import type { KeyboardEvent, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import type { RecruiterJobCreateTranslations, RecruiterJobsTranslations } from '../../../i18n/types'
import type { ApiMeta, RecruiterJobResponse } from '../../../types/job.types'
import type { RecruiterJobAction, RecruiterJobActionState } from '../types'
import {
  formatRecruiterJobDate,
  formatRecruiterJobSalary,
  splitJobCount,
} from '../utils/recruiterJobsData'
import { RecruiterJobActions } from './RecruiterJobActions'
import { RecruiterJobStatusBadge } from './RecruiterJobStatusBadge'

type RecruiterJobListProps = {
  actionState: RecruiterJobActionState
  applicationCounts?: Readonly<Record<string, number>>
  createTranslations: RecruiterJobCreateTranslations
  jobs: RecruiterJobResponse[]
  locale: string
  meta: ApiMeta
  onAction: (job: RecruiterJobResponse, action: RecruiterJobAction) => void
  onOpenJob: (jobId: string) => void
  onPageChange: (page: number) => void
  translations: RecruiterJobsTranslations
}

const DEADLINE_SOON_MS = 7 * 24 * 60 * 60 * 1000

type DeadlineState = {
  className: string
  isOverdue: boolean
  isSoon: boolean
}

function getDeadlineState(deadline: string | null): DeadlineState | null {
  if (!deadline) {
    return null
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()

  if (Number.isNaN(diffMs)) {
    return null
  }

  if (diffMs < 0) {
    return { className: 'is-deadline-overdue', isOverdue: true, isSoon: true }
  }

  if (diffMs <= DEADLINE_SOON_MS) {
    return { className: 'is-deadline-soon', isOverdue: false, isSoon: true }
  }

  return null
}

function createApplicationsHref(jobId: string) {
  return `/recruiter/applications?jobId=${encodeURIComponent(jobId)}`
}

function isInteractiveEventTarget(event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>) {
  const target = event.target

  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea, [role="button"], [role="link"]'))
}

function handleOpenKeyDown(
  event: KeyboardEvent<HTMLElement>,
  jobId: string,
  onOpenJob: (jobId: string) => void,
) {
  if (isInteractiveEventTarget(event)) {
    return
  }

  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  onOpenJob(jobId)
}

function handleOpenClick(
  event: MouseEvent<HTMLElement>,
  jobId: string,
  onOpenJob: (jobId: string) => void,
) {
  if (isInteractiveEventTarget(event)) {
    return
  }

  onOpenJob(jobId)
}

function renderJobMeta(
  job: RecruiterJobResponse,
  createTranslations: RecruiterJobCreateTranslations,
) {
  return [
    job.employmentType
      ? createTranslations.form.options.employmentTypes[job.employmentType]
      : null,
    job.workingType
      ? createTranslations.form.options.workingTypes[job.workingType]
      : null,
    job.experienceLevel
      ? createTranslations.form.options.experienceLevels[job.experienceLevel]
      : null,
  ].filter((label): label is string => Boolean(label)).join(' · ')
}

function hasPriorityStatus(job: RecruiterJobResponse) {
  return job.status === 'DRAFT' ||
    job.status === 'NEEDS_REVIEW' ||
    job.status === 'SHOULD_REJECT' ||
    job.status === 'REJECTED'
}

export function RecruiterJobList({
  actionState,
  applicationCounts = {},
  createTranslations,
  jobs,
  locale,
  meta,
  onAction,
  onOpenJob,
  onPageChange,
  translations,
}: RecruiterJobListProps) {
  return (
    <section className="recruiter-jobs-panel" aria-label={translations.table.job}>
      <div className="recruiter-jobs-list">
        {jobs.map((job) => {
          const deadlineState = getDeadlineState(job.deadline)
          const baseClassName = `recruiter-job-row-card${hasPriorityStatus(job) ? ' is-priority' : ''}`
          const cardClassName = deadlineState ? `${baseClassName} ${deadlineState.className}` : baseClassName
          const deadlineClassName = deadlineState
            ? `recruiter-job-row-card__deadline ${deadlineState.className}`
            : 'recruiter-job-row-card__deadline'
          const deadlineTitle = deadlineState && job.deadline
            ? `${translations.table.deadline}: ${job.deadline}`
            : undefined
          const applicationCount = applicationCounts[job.id] ?? job.applicationCount

          return (
            <article
              className={cardClassName}
              data-deadline-state={deadlineState?.className ?? 'normal'}
              key={job.id}
              onClick={(event) => handleOpenClick(event, job.id, onOpenJob)}
              onKeyDown={(event) => handleOpenKeyDown(event, job.id, onOpenJob)}
              tabIndex={0}
            >
              <div className="recruiter-job-row-card__main">
                <RecruiterJobStatusBadge
                  label={createTranslations.statusLabels[job.status]}
                  status={job.status}
                />
                <div className="recruiter-job-title-cell">
                  <Link
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    to={`/recruiter/jobs/${job.id}`}
                  >
                    {job.title}
                  </Link>
                  <span>{renderJobMeta(job, createTranslations)}</span>
                  <small>{job.location}</small>
                </div>
              </div>

              <dl className="recruiter-job-row-card__metrics">
                <div>
                  <dt>{translations.table.applications}</dt>
                  <dd>
                    <Link
                      aria-label={`${translations.actions.viewApplications}: ${job.title}`}
                      className="recruiter-job-row-card__applications"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      to={createApplicationsHref(job.id)}
                    >
                      {(() => {
                        const { number, suffix } = splitJobCount(
                          applicationCount,
                          locale,
                          translations.metrics.applicationsSuffix,
                        )
                        return (
                          <>
                            <strong>{number}</strong>
                            <span className="recruiter-job-row-card__applications-suffix">{suffix}</span>
                          </>
                        )
                      })()}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>{translations.table.deadline}</dt>
                  <dd
                    className={deadlineClassName}
                    title={deadlineTitle}
                  >
                    {formatRecruiterJobDate(job.deadline, locale, translations.metrics.noDeadline)}
                  </dd>
                </div>
                <div>
                  <dt>{translations.table.updated}</dt>
                  <dd>{formatRecruiterJobDate(job.updatedAt, locale, translations.metrics.noData)}</dd>
                </div>
              </dl>

              <p className="recruiter-job-row-card__salary">
                {formatRecruiterJobSalary(
                  job,
                  locale,
                  translations.metrics.salaryHidden,
                  translations.metrics.salaryNegotiable,
                )}
              </p>

              <RecruiterJobActions
                actionState={actionState}
                editHref={`/recruiter/jobs/${job.id}/edit`}
                job={job}
                onAction={onAction}
                translations={translations}
              />
            </article>
          )
        })}
      </div>

      {meta.totalPages > 1 ? (
        <div className="recruiter-jobs-pagination">
          <button disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} type="button">
            ‹
          </button>
          <span>
            {meta.page}/{meta.totalPages}
          </span>
          <button disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)} type="button">
            ›
          </button>
        </div>
      ) : null}
    </section>
  )
}
