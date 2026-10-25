import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLocale, useTranslations } from '../../i18n'
import type { RecruiterJobsTranslations } from '../../i18n/types'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import { jobService } from '../../services/job.service'
import type { ApplicationResponse } from '../../types/application.types'
import type { RecruiterJobResponse } from '../../types/job.types'
import { Button, ConfirmModal, ReasonModal } from '../_components'
import { RecruiterJobActions } from './components/RecruiterJobActions'
import { RecruiterJobFilters } from './components/RecruiterJobFilters'
import { RecruiterJobList } from './components/RecruiterJobList'
import { RecruiterJobSummary } from './components/RecruiterJobSummary'
import { RecruiterJobStatusBadge } from './components/RecruiterJobStatusBadge'
import { RecruiterJobStatusTabs } from './components/RecruiterJobStatusTabs'
import { useRecruiterJobs } from './hooks/useRecruiterJobs'
import type { RecruiterJobAction, RecruiterJobActionState } from './types'
import {
  canJobHaveApplications,
  formatJobCount,
  formatRecruiterJobDate,
  formatRecruiterJobSalary,
} from './utils/recruiterJobsData'
import './recruiter-jobs-page.css'

function createApplicationsHref(jobId: string, applicationId?: string) {
  const params = new URLSearchParams({ jobId })

  if (applicationId) {
    params.set('applicationId', applicationId)
  }

  return `/recruiter/applications?${params.toString()}`
}

type JobActionResult =
  | {
      job: RecruiterJobResponse
      type: 'updated'
    }
  | {
      type: 'deleted'
    }
  | {
      type: 'cancelled'
    }

async function executeRecruiterJobAction(
  job: RecruiterJobResponse,
  action: RecruiterJobAction,
  reason?: string,
): Promise<JobActionResult> {
  if (action === 'submit') {
    return { job: await jobService.submitRecruiterJob(job.id), type: 'updated' }
  }

  if (action === 'delete') {
    await jobService.deleteRecruiterJob(job.id)
    return { type: 'deleted' }
  }

  if (action === 'republish') {
    return { job: await jobService.republishRecruiterJob(job.id), type: 'updated' }
  }

  if (action === 'unpublish') {
    return {
      job: await jobService.unpublishRecruiterJob(job.id, { reason: reason?.trim() || null }),
      type: 'updated',
    }
  }

  return {
    job: await jobService.closeRecruiterJob(job.id, { reason: reason?.trim() || null }),
    type: 'updated',
  }
}

type RecruiterJobActionModalsProps = {
  actionState: RecruiterJobActionState
  cancelLabel: string
  content: RecruiterJobsTranslations
  onCancel: () => void
  onConfirm: (reason?: string) => Promise<void>
  pendingAction: {
    action: RecruiterJobAction
    job: RecruiterJobResponse
  } | null
}

function RecruiterJobActionModals({
  actionState,
  cancelLabel,
  content,
  onCancel,
  onConfirm,
  pendingAction,
}: RecruiterJobActionModalsProps) {
  if (!pendingAction) return null

  const isConfirmAction =
    pendingAction.action === 'submit' ||
    pendingAction.action === 'delete' ||
    pendingAction.action === 'republish'

  const isReasonAction =
    pendingAction.action === 'unpublish' ||
    pendingAction.action === 'close'

  const getConfirmDescription = () => {
    if (pendingAction.action === 'submit') return content.actions.confirmSubmit
    if (pendingAction.action === 'delete') return content.actions.confirmDelete
    if (pendingAction.action === 'republish') return content.actions.confirmRepublish
    return ''
  }

  const getReasonLabel = () => {
    if (pendingAction.action === 'unpublish') return content.actions.reasonUnpublishPrompt
    if (pendingAction.action === 'close') return content.actions.reasonClosePrompt
    return ''
  }

  const actionTitle = content.actions[pendingAction.action]

  return (
    <>
      <ConfirmModal
        cancelLabel={cancelLabel}
        confirmLabel={actionTitle}
        description={getConfirmDescription()}
        isOpen={isConfirmAction}
        isPending={Boolean(actionState)}
        onCancel={onCancel}
        onConfirm={() => void onConfirm()}
        title={actionTitle}
      />
      <ReasonModal
        cancelLabel={cancelLabel}
        confirmLabel={actionTitle}
        description={pendingAction.job.title}
        inputLabel={getReasonLabel()}
        isOpen={isReasonAction}
        isPending={Boolean(actionState)}
        onCancel={onCancel}
        onConfirm={(reason) => void onConfirm(reason)}
        required={false}
        title={actionTitle}
      />
    </>
  )
}

function JobPageState({
  action,
  description,
  title,
}: {
  action?: () => void
  description: string
  title: string
}) {
  const { pages } = useTranslations()

  return (
    <section className="recruiter-jobs-state recruiter-panel">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <Button onClick={action}>{pages.recruiterJobs.states.retry}</Button> : null}
    </section>
  )
}

function JobDetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function JobDetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="recruiter-job-detail-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function RecruiterJobsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterJobs
  const createContent = pages.recruiterJobCreate
  const navigate = useNavigate()
  const {
    applySearch,
    clearFilters,
    counts,
    error,
    filters,
    isLoading,
    jobs,
    loadJobs,
    meta,
    searchInput,
    setPage,
    setSearchInput,
    setSort,
    setStatus,
  } = useRecruiterJobs(content.states.errorDescription)
  const [actionState, setActionState] = useState<RecruiterJobActionState>(null)
  const [actionError, setActionError] = useState<string | undefined>(undefined)
  const [jobApplicationCounts, setJobApplicationCounts] = useState<Readonly<Record<string, number>>>({})
  const [pendingAction, setPendingAction] = useState<{
    action: RecruiterJobAction
    job: RecruiterJobResponse
  } | null>(null)

  const cancelLabel =
    pages.recruiterApplications?.drawer?.decision?.confirmModal?.cancelAction ??
    (locale === 'vi' ? 'Hủy' : locale === 'ja' ? 'キャンセル' : 'Cancel')

  useEffect(() => {
    let ignore = false

    if (jobs.length === 0) {
      setJobApplicationCounts({})
      return () => {
        ignore = true
      }
    }

    async function loadVisibleJobApplicationCounts() {
      const entries = await Promise.all(
        jobs.map(async (job) => {
          try {
            const response = await applicationService.getRecruiterApplications({
              jobId: job.id,
              limit: 1,
              page: 1,
            })

            return [job.id, response.meta.total] as const
          } catch {
            return [job.id, job.applicationCount] as const
          }
        }),
      )

      if (!ignore) {
        setJobApplicationCounts(Object.fromEntries(entries))
      }
    }

    void loadVisibleJobApplicationCounts()

    return () => {
      ignore = true
    }
  }, [jobs])

  const handleAction = useCallback(
    (job: RecruiterJobResponse, action: RecruiterJobAction) => {
      setActionError(undefined)
      setPendingAction({ action, job })
    },
    [],
  )

  const handleConfirmAction = useCallback(
    async (reason?: string) => {
      if (!pendingAction) return
      const { action, job } = pendingAction
      setActionError(undefined)
      setActionState({ action, jobId: job.id })

      try {
        const result = await executeRecruiterJobAction(job, action, reason)
        setPendingAction(null)

        if (result.type !== 'cancelled') {
          await loadJobs()
        }
      } catch (actionErrorValue) {
        setActionError(getApiErrorEnvelope(actionErrorValue)?.error.message ?? content.actions.actionError)
      } finally {
        setActionState(null)
      }
    },
    [content.actions.actionError, loadJobs, pendingAction],
  )

  return (
    <div className="recruiter-jobs-page">
      <section className="recruiter-jobs-page-header">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>
        </div>
        <Link
          className="job-post-link-button job-post-link-button--primary"
          state={{ from: '/recruiter/jobs' }}
          to="/recruiter/jobs/new"
        >
          {content.hero.createAction}
        </Link>
      </section>

      <RecruiterJobStatusTabs
        activeStatus={filters.status}
        counts={counts}
        jobLabels={createContent.statusLabels}
        onChange={setStatus}
        translations={content}
      />

      <RecruiterJobSummary counts={counts} locale={locale} translations={content} />

      <RecruiterJobFilters
        filters={filters}
        onApplySearch={applySearch}
        onClear={clearFilters}
        onSearchInputChange={setSearchInput}
        onSortChange={setSort}
        searchInput={searchInput}
        translations={content}
      />

      {actionError ? (
        <p className="recruiter-jobs-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {error ? (
        <JobPageState
          action={() => void loadJobs()}
          description={error}
          title={content.states.errorTitle}
        />
      ) : isLoading ? (
        <JobPageState description={content.states.loading} title={content.states.loading} />
      ) : jobs.length ? (
        <RecruiterJobList
          actionState={actionState}
          applicationCounts={jobApplicationCounts}
          createTranslations={createContent}
          jobs={jobs}
          locale={locale}
          meta={meta}
          onAction={handleAction}
          onOpenJob={(jobId) => navigate(`/recruiter/jobs/${jobId}`)}
          onPageChange={setPage}
          translations={content}
        />
      ) : (
        <JobPageState
          description={content.states.emptyDescription}
          title={content.states.emptyTitle}
        />
      )}

      <RecruiterJobActionModals
        actionState={actionState}
        cancelLabel={cancelLabel}
        content={content}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        pendingAction={pendingAction}
      />
    </div>
  )
}

export function RecruiterJobDetailPage() {
  const { id } = useParams()
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterJobs
  const createContent = pages.recruiterJobCreate
  const navigate = useNavigate()
  const [job, setJob] = useState<RecruiterJobResponse | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)
  const [actionState, setActionState] = useState<RecruiterJobActionState>(null)
  const [pendingAction, setPendingAction] = useState<{
    action: RecruiterJobAction
    job: RecruiterJobResponse
  } | null>(null)
  const [jobApplications, setJobApplications] = useState<ApplicationResponse[]>([])
  const [jobApplicationsTotal, setJobApplicationsTotal] = useState<number | null>(null)
  const [isApplicationsLoading, setApplicationsLoading] = useState(false)

  const canViewApplications = job
    ? canJobHaveApplications(job.status, jobApplicationsTotal ?? job.applicationCount)
    : false

  const cancelLabel =
    pages.recruiterApplications?.drawer?.decision?.confirmModal?.cancelAction ??
    (locale === 'vi' ? 'Hủy' : locale === 'ja' ? 'キャンセル' : 'Cancel')

  const loadJob = useCallback(async () => {
    if (!id) {
      setError(content.states.detailErrorDescription)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      setJob(await jobService.getRecruiterJobById(id))
    } catch (loadError) {
      setJob(null)
      setError(getApiErrorEnvelope(loadError)?.error.message ?? content.states.detailErrorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.detailErrorDescription, id])

  useEffect(() => {
    void loadJob()
  }, [loadJob])

  useEffect(() => {
    if (!id || !canViewApplications) {
      setJobApplications([])
      setJobApplicationsTotal(0)
      return
    }

    async function loadJobApplications() {
      setApplicationsLoading(true)
      setJobApplicationsTotal(null)

      try {
        const response = await applicationService.getRecruiterApplications({
          jobId: id,
          limit: 6,
          page: 1,
          sortBy: 'matchScore',
          sortOrder: 'desc',
        })
        setJobApplications(response.data)
        setJobApplicationsTotal(response.meta.total)
      } catch {
        setJobApplications([])
        setJobApplicationsTotal(0)
      } finally {
        setApplicationsLoading(false)
      }
    }

    void loadJobApplications()
  }, [canViewApplications, id])

  const handleAction = useCallback(
    (targetJob: RecruiterJobResponse, action: RecruiterJobAction) => {
      setActionError(undefined)
      setPendingAction({ action, job: targetJob })
    },
    [],
  )

  const handleConfirmAction = useCallback(
    async (reason?: string) => {
      if (!pendingAction) return
      const { action, job: targetJob } = pendingAction
      setActionError(undefined)
      setActionState({ action, jobId: targetJob.id })

      try {
        const result = await executeRecruiterJobAction(targetJob, action, reason)
        setPendingAction(null)

        if (result.type === 'updated') {
          setJob(result.job)
        }

        if (result.type === 'deleted') {
          navigate('/recruiter/jobs')
        }
      } catch (actionErrorValue) {
        setActionError(getApiErrorEnvelope(actionErrorValue)?.error.message ?? content.actions.actionError)
      } finally {
        setActionState(null)
      }
    },
    [content.actions.actionError, navigate, pendingAction],
  )

  if (isLoading) {
    return (
      <div className="recruiter-job-detail-page">
        <JobPageState description={content.states.detailLoading} title={content.states.detailLoading} />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="recruiter-job-detail-page">
        <JobPageState
          action={() => void loadJob()}
          description={error ?? content.states.detailErrorDescription}
          title={content.states.detailErrorTitle}
        />
      </div>
    )
  }

  const statusLabel = createContent.statusLabels[job.status]
  const salary = formatRecruiterJobSalary(
    job,
    locale,
    content.metrics.salaryHidden,
    content.metrics.salaryNegotiable,
  )
  const deadline = formatRecruiterJobDate(job.deadline, locale, content.metrics.noDeadline)
  const publishedAt = formatRecruiterJobDate(job.publishedAt, locale, content.metrics.noData)
  const updatedAt = formatRecruiterJobDate(job.updatedAt, locale, content.metrics.noData)
  const visibleApplicationCount = jobApplicationsTotal ?? job.applicationCount
  const applications = formatJobCount(visibleApplicationCount, locale, content.metrics.applicationsSuffix)
  const openings = job.numberOfOpenings == null
    ? content.metrics.noData
    : formatJobCount(job.numberOfOpenings, locale, content.metrics.openingsSuffix)
  const reviewStatus = job.review?.status ?? job.status
  const reviewMessage = job.review?.message ?? job.review?.reason ?? job.reviewReason ?? content.detail.noReason
  const reviewTime = job.review?.reviewedAt ?? job.reviewedAt

  return (
    <div className="recruiter-job-detail-page">
      <section className="recruiter-jobs-page-header recruiter-job-detail-header">
        <div>
          <Link className="recruiter-job-detail-back" to="/recruiter/jobs">
            <span aria-hidden="true" className="recruiter-job-detail-back__icon">
              ←
            </span>
            {content.actions.backToList}
          </Link>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h1>{job.title}</h1>
          <div className="recruiter-job-detail-heading-meta">
            <RecruiterJobStatusBadge label={statusLabel} status={job.status} />
            <span>{content.detail.jobId}: {job.id}</span>
          </div>
          <dl className="recruiter-job-detail-hero-metrics">
            <JobDetailMetric
              label={content.detail.applications}
              value={canViewApplications ? applications : content.metrics.noData}
            />
            <JobDetailMetric label={content.detail.deadline} value={deadline} />
            <JobDetailMetric label={content.detail.updatedAt} value={updatedAt} />
          </dl>
        </div>
        <div className="recruiter-job-detail-header__actions">
          {canViewApplications ? (
            <Link className="job-post-link-button job-post-link-button--primary" to={createApplicationsHref(job.id)}>
              {content.actions.viewApplications}
            </Link>
          ) : null}
          {job.status === 'PUBLISHED' ? (
            <Link className="job-post-link-button" to={`/jobs/${job.id}`}>
              {content.actions.viewPublic}
            </Link>
          ) : (
            <span>{content.detail.publicLinkUnavailable}</span>
          )}
          <RecruiterJobActions
            actionState={actionState}
            editHref={`/recruiter/jobs/${job.id}/edit`}
            job={job}
            onAction={handleAction}
            translations={content}
          />
        </div>
      </section>

      {actionError ? (
        <p className="recruiter-jobs-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="recruiter-job-detail-grid">
        <section className="recruiter-job-detail-panel recruiter-job-detail-panel--overview recruiter-panel">
          <h2>{content.detail.overview}</h2>
          <dl className="recruiter-job-detail-facts">
            <JobDetailValue
              label={content.detail.location}
              value={job.location ?? content.metrics.noData}
            />
            <JobDetailValue label={content.detail.salary} value={salary} />
            <JobDetailValue label={content.detail.openings} value={openings} />
            <JobDetailValue
              label={content.detail.employmentType}
              value={
                job.employmentType
                  ? createContent.form.options.employmentTypes[job.employmentType]
                  : content.metrics.noData
              }
            />
            <JobDetailValue
              label={content.detail.workingType}
              value={
                job.workingType
                  ? createContent.form.options.workingTypes[job.workingType]
                  : content.metrics.noData
              }
            />
            <JobDetailValue
              label={content.detail.experienceLevel}
              value={
                job.experienceLevel
                  ? createContent.form.options.experienceLevels[job.experienceLevel]
                  : content.metrics.noData
              }
            />
            <JobDetailValue label={content.detail.publishedAt} value={publishedAt} />
            <JobDetailValue label={content.detail.version} value={String(job.version)} />
          </dl>
        </section>

        <section className="recruiter-job-detail-panel recruiter-job-detail-panel--content recruiter-panel">
          <h2>{content.detail.content}</h2>
          <div className="recruiter-job-detail-skills">
            <h3>{content.detail.skills}</h3>
            <ul>
              {job.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
          <article>
            <h3>{content.detail.description}</h3>
            <p>{job.description}</p>
          </article>
          <article>
            <h3>{content.detail.requirements}</h3>
            <p>{job.requirements}</p>
          </article>
          <article>
            <h3>{content.detail.benefits}</h3>
            <p>{job.benefits || content.detail.noBenefits}</p>
          </article>
        </section>
      </div>

      {canViewApplications ? (
        <section className="recruiter-job-detail-panel recruiter-job-detail-panel--applications recruiter-panel">
          <header className="recruiter-job-detail-applications__header">
            <div>
              <h2>{content.detail.applications}</h2>
              <p>{content.detail.applicationsDescription}</p>
            </div>
            <Link to={createApplicationsHref(job.id)}>
              <span>{visibleApplicationCount}</span>
              {content.actions.viewApplications}
            </Link>
          </header>
          {isApplicationsLoading ? (
            <p className="recruiter-job-detail-muted">{content.states.loading}</p>
          ) : jobApplications.length ? (
            <div className="recruiter-job-detail-applications">
              {jobApplications.map((application) => (
                <Link key={application.id} to={createApplicationsHref(job.id, application.id)}>
                  <span className="recruiter-job-detail-applications__candidate">
                    <strong>{application.candidateFullName}</strong>
                    <small>{application.candidateEmail}</small>
                  </span>
                  <span className="recruiter-job-detail-applications__score">
                    {application.matchScore == null ? content.metrics.noData : application.matchScore}
                  </span>
                  <span className="recruiter-job-detail-applications__level">
                    {application.matchLevel ? pages.recruiterApplications.match.levels[application.matchLevel] : content.metrics.noData}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="recruiter-job-detail-muted">{content.detail.noApplications}</p>
          )}
        </section>
      ) : null}

      <section className="recruiter-job-detail-panel recruiter-job-detail-panel--review recruiter-panel">
        <h2>{content.detail.moderation}</h2>
        <dl className="recruiter-job-detail-facts">
          <JobDetailValue label={content.detail.reviewStatus} value={reviewStatus} />
          <JobDetailValue
            label={content.detail.reviewedAt}
            value={reviewTime ? formatRecruiterJobDate(reviewTime, locale, content.metrics.noData) : content.metrics.noData}
          />
          <JobDetailValue label={content.detail.unpublishReason} value={job.unpublishReason || content.detail.noReason} />
        </dl>
        <div className="recruiter-job-detail-notes">
          <h3>{content.detail.reviewMessage}</h3>
          <p>{reviewMessage}</p>
        </div>
      </section>

      <RecruiterJobActionModals
        actionState={actionState}
        cancelLabel={cancelLabel}
        content={content}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        pendingAction={pendingAction}
      />
    </div>
  )
}
