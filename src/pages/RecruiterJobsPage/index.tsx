import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLocale, useTranslations } from '../../i18n'
import type { RecruiterJobsTranslations } from '../../i18n/types'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { jobService } from '../../services/job.service'
import type { RecruiterJobResponse } from '../../types/job.types'
import { Button } from '../_components'
import { RecruiterJobActions } from './components/RecruiterJobActions'
import { RecruiterJobFilters } from './components/RecruiterJobFilters'
import { RecruiterJobList } from './components/RecruiterJobList'
import { RecruiterJobSummary } from './components/RecruiterJobSummary'
import { RecruiterJobStatusBadge } from './components/RecruiterJobStatusBadge'
import { RecruiterJobStatusTabs } from './components/RecruiterJobStatusTabs'
import { useRecruiterJobs } from './hooks/useRecruiterJobs'
import type { RecruiterJobAction, RecruiterJobActionState } from './types'
import {
  formatJobCount,
  formatRecruiterJobDate,
  formatRecruiterJobSalary,
} from './utils/recruiterJobsData'

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

async function runRecruiterJobAction(
  job: RecruiterJobResponse,
  action: RecruiterJobAction,
  translations: RecruiterJobsTranslations,
): Promise<JobActionResult> {
  if (action === 'submit' && !window.confirm(translations.actions.confirmSubmit)) {
    return { type: 'cancelled' }
  }

  if (action === 'delete' && !window.confirm(translations.actions.confirmDelete)) {
    return { type: 'cancelled' }
  }

  if (action === 'republish' && !window.confirm(translations.actions.confirmRepublish)) {
    return { type: 'cancelled' }
  }

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
    const reason = window.prompt(translations.actions.reasonUnpublishPrompt)

    if (reason === null) {
      return { type: 'cancelled' }
    }

    return {
      job: await jobService.unpublishRecruiterJob(job.id, { reason: reason.trim() || null }),
      type: 'updated',
    }
  }

  const reason = window.prompt(translations.actions.reasonClosePrompt)

  if (reason === null) {
    return { type: 'cancelled' }
  }

  return {
    job: await jobService.closeRecruiterJob(job.id, { reason: reason.trim() || null }),
    type: 'updated',
  }
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

  const handleAction = useCallback(
    async (job: RecruiterJobResponse, action: RecruiterJobAction) => {
      setActionError(undefined)
      setActionState({ action, jobId: job.id })

      try {
        const result = await runRecruiterJobAction(job, action, content)

        if (result.type !== 'cancelled') {
          await loadJobs()
        }
      } catch (actionErrorValue) {
        setActionError(getApiErrorEnvelope(actionErrorValue)?.error.message ?? content.actions.actionError)
      } finally {
        setActionState(null)
      }
    },
    [content, loadJobs],
  )

  return (
    <div className="recruiter-jobs-page">
      <section className="recruiter-jobs-page-header">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>
        </div>
        <Link className="job-post-link-button job-post-link-button--primary" to="/recruiter/jobs/new">
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

  const handleAction = useCallback(
    async (targetJob: RecruiterJobResponse, action: RecruiterJobAction) => {
      setActionError(undefined)
      setActionState({ action, jobId: targetJob.id })

      try {
        const result = await runRecruiterJobAction(targetJob, action, content)

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
    [content, navigate],
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
  const applications = formatJobCount(job.applicationCount, locale, content.metrics.applicationsSuffix)
  const openings = job.numberOfOpenings == null
    ? content.metrics.noData
    : formatJobCount(job.numberOfOpenings, locale, content.metrics.openingsSuffix)
  const hasModeration =
    job.moderation.riskScore !== null ||
    job.moderation.riskLevel !== null ||
    job.moderation.decision !== null ||
    job.moderation.reasons.length > 0 ||
    job.moderation.matchedRules.length > 0

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
            <JobDetailMetric label={content.detail.applications} value={applications} />
            <JobDetailMetric label={content.detail.deadline} value={deadline} />
            <JobDetailMetric label={content.detail.updatedAt} value={updatedAt} />
          </dl>
        </div>
        <div className="recruiter-job-detail-header__actions">
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
            <JobDetailValue label={content.detail.location} value={job.location} />
            <JobDetailValue label={content.detail.salary} value={salary} />
            <JobDetailValue label={content.detail.openings} value={openings} />
            <JobDetailValue
              label={content.detail.employmentType}
              value={createContent.form.options.employmentTypes[job.employmentType]}
            />
            <JobDetailValue
              label={content.detail.workingType}
              value={createContent.form.options.workingTypes[job.workingType]}
            />
            <JobDetailValue
              label={content.detail.experienceLevel}
              value={createContent.form.options.experienceLevels[job.experienceLevel]}
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

      <details
        className="recruiter-job-detail-panel recruiter-job-detail-panel--moderation recruiter-panel"
        open={hasModeration}
      >
        <summary className="recruiter-job-detail-panel__summary">{content.detail.moderation}</summary>
        {hasModeration ? (
          <dl className="recruiter-job-detail-facts">
            <JobDetailValue
              label={content.detail.riskScore}
              value={job.moderation.riskScore == null ? content.metrics.noData : String(job.moderation.riskScore)}
            />
            <JobDetailValue
              label={content.detail.riskLevel}
              value={job.moderation.riskLevel ?? content.metrics.noData}
            />
            <JobDetailValue
              label={content.detail.moderationDecision}
              value={job.moderation.decision ?? content.metrics.noData}
            />
          </dl>
        ) : (
          <p className="recruiter-job-detail-muted">{content.detail.noModeration}</p>
        )}

        <div className="recruiter-job-detail-notes">
          <h3>{content.detail.adminReason}</h3>
          <p>{job.reviewReason || content.detail.noReason}</p>
          <h3>{content.detail.unpublishReason}</h3>
          <p>{job.unpublishReason || content.detail.noReason}</p>
        </div>

        {job.moderation.reasons.length ? (
          <div className="recruiter-job-detail-notes">
            <h3>{content.detail.moderationReasons}</h3>
            <ul>
              {job.moderation.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.moderation.matchedRules.length ? (
          <div className="recruiter-job-detail-notes">
            <h3>{content.detail.matchedRules}</h3>
            <ul>
              {job.moderation.matchedRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </details>
    </div>
  )
}
