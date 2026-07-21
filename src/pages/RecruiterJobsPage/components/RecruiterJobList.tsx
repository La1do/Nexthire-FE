import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { RecruiterJobCreateTranslations, RecruiterJobsTranslations } from '../../../i18n/types'
import type { ApiMeta, RecruiterJobResponse } from '../../../types/job.types'
import type { RecruiterJobAction, RecruiterJobActionState } from '../types'
import {
  formatJobCount,
  formatRecruiterJobDate,
  formatRecruiterJobSalary,
} from '../utils/recruiterJobsData'
import { RecruiterJobActions } from './RecruiterJobActions'
import { RecruiterJobStatusBadge } from './RecruiterJobStatusBadge'

type RecruiterJobListProps = {
  actionState: RecruiterJobActionState
  createTranslations: RecruiterJobCreateTranslations
  jobs: RecruiterJobResponse[]
  locale: string
  meta: ApiMeta
  onAction: (job: RecruiterJobResponse, action: RecruiterJobAction) => void
  onOpenJob: (jobId: string) => void
  onPageChange: (page: number) => void
  translations: RecruiterJobsTranslations
}

function handleOpenKeyDown(
  event: KeyboardEvent<HTMLElement>,
  jobId: string,
  onOpenJob: (jobId: string) => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  onOpenJob(jobId)
}

function renderJobMeta(
  job: RecruiterJobResponse,
  createTranslations: RecruiterJobCreateTranslations,
) {
  return [
    createTranslations.form.options.employmentTypes[job.employmentType],
    createTranslations.form.options.workingTypes[job.workingType],
    createTranslations.form.options.experienceLevels[job.experienceLevel],
  ].filter(Boolean).join(' · ')
}

export function RecruiterJobList({
  actionState,
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
    <section className="recruiter-jobs-panel">
      <div className="recruiter-jobs-table-shell">
        <table className="recruiter-jobs-table">
          <thead>
            <tr>
              <th>{translations.table.job}</th>
              <th>{translations.table.status}</th>
              <th>{translations.table.applications}</th>
              <th>{translations.table.deadline}</th>
              <th>{translations.table.updated}</th>
              <th>{translations.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                className="recruiter-jobs-row"
                key={job.id}
                onClick={() => onOpenJob(job.id)}
                onKeyDown={(event) => handleOpenKeyDown(event, job.id, onOpenJob)}
                tabIndex={0}
              >
                <td>
                  <div className="recruiter-job-title-cell">
                    <Link
                      onClick={(event) => event.stopPropagation()}
                      to={`/recruiter/jobs/${job.id}`}
                    >
                      {job.title}
                    </Link>
                    <span>{renderJobMeta(job, createTranslations)}</span>
                    <small>{job.location}</small>
                  </div>
                </td>
                <td>
                  <RecruiterJobStatusBadge
                    label={createTranslations.statusLabels[job.status]}
                    status={job.status}
                  />
                </td>
                <td>
                  {formatJobCount(job.applicationCount, locale, translations.metrics.applicationsSuffix)}
                </td>
                <td>
                  {formatRecruiterJobDate(job.deadline, locale, translations.metrics.noDeadline)}
                </td>
                <td>
                  {formatRecruiterJobDate(job.updatedAt, locale, translations.metrics.noData)}
                </td>
                <td>
                  <RecruiterJobActions
                    actionState={actionState}
                    editHref={`/recruiter/jobs/${job.id}/edit`}
                    job={job}
                    onAction={onAction}
                    translations={translations}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recruiter-jobs-cards">
        {jobs.map((job) => (
          <article
            className="recruiter-job-card-row"
            key={job.id}
            onClick={() => onOpenJob(job.id)}
            onKeyDown={(event) => handleOpenKeyDown(event, job.id, onOpenJob)}
            tabIndex={0}
          >
            <div className="recruiter-job-card-row__header">
              <div>
                <Link onClick={(event) => event.stopPropagation()} to={`/recruiter/jobs/${job.id}`}>
                  {job.title}
                </Link>
                <p>{renderJobMeta(job, createTranslations)}</p>
              </div>
              <RecruiterJobStatusBadge
                label={createTranslations.statusLabels[job.status]}
                status={job.status}
              />
            </div>
            <dl>
              <div>
                <dt>{translations.table.applications}</dt>
                <dd>{formatJobCount(job.applicationCount, locale, translations.metrics.applicationsSuffix)}</dd>
              </div>
              <div>
                <dt>{translations.table.deadline}</dt>
                <dd>{formatRecruiterJobDate(job.deadline, locale, translations.metrics.noDeadline)}</dd>
              </div>
              <div>
                <dt>{translations.detail.salary}</dt>
                <dd>
                  {formatRecruiterJobSalary(
                    job,
                    locale,
                    translations.metrics.salaryHidden,
                    translations.metrics.salaryNegotiable,
                  )}
                </dd>
              </div>
              <div>
                <dt>{translations.detail.location}</dt>
                <dd>{job.location}</dd>
              </div>
            </dl>
            <RecruiterJobActions
              actionState={actionState}
              editHref={`/recruiter/jobs/${job.id}/edit`}
              job={job}
              onAction={onAction}
              translations={translations}
            />
          </article>
        ))}
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
