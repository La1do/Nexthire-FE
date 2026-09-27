import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../../context'
import { useLocale, useTranslations } from '../../../i18n'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import type { ApplicationResponse } from '../../../types/application.types'
import { Button } from '../../_components'
import { AdminPagination } from '../../_components/admin/AdminPagination'
import { useApplicationJobOptions } from '../hooks/useApplicationJobs'
import {
  useJobApplicationDetail,
  useJobApplicationStats,
  useJobApplications,
  useJobApplicationsCache,
} from '../hooks/useJobApplications'
import type {
  ApplicationJobAccess,
  RecruiterApplicationCriteria,
  RecruiterApplicationItem,
  RecruiterApplicationStats,
} from '../types'
import { isForbiddenError } from '../utils/applicationAccessErrors'
import { APPLICATION_JOBS_PATH, getJobApplicationsHref } from '../utils/applicationRoutes'
import type { RecruiterDecisionStatus } from '../utils/recruiterApplicationDecisionValidation'
import { createRecruiterApplicationFromApi } from '../utils/recruiterApplicationApi'
import { isActiveRecruiterApplicationFilters } from '../utils/recruiterApplicationsFilters'
import {
  fetchApplicationCv,
  requestApplicationMatch,
  updateApplicationDecision,
} from '../utils/applicationsWorkspaceData'
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer'
import { ApplicationFilters } from './ApplicationFilters'
import { ApplicationJobHeader } from './ApplicationJobHeader'
import { ApplicationJobStats } from './ApplicationJobStats'
import { ApplicationMobileList } from './ApplicationMobileList'
import { ApplicationTable } from './ApplicationTable'
import { ApplicationsStatePanel } from './ApplicationsStatePanel'

type ApplicationJobWorkspaceProps = {
  access: ApplicationJobAccess
}

const PAGE_SIZE = 6
const MATCH_POLL_INTERVAL_MS = 4_000
const MATCH_POLL_TIMEOUT_MS = 90_000
const emptyApplicationStats: RecruiterApplicationStats = {
  interview: 0,
  new: 0,
  responseRate: '0%',
  total: 0,
}
const defaultCriteria: RecruiterApplicationCriteria = {
  query: '',
  sort: 'newest',
  status: 'all',
}

function readApplicationCriteria(searchParams: URLSearchParams): RecruiterApplicationCriteria {
  const sort = searchParams.get('sort')
  const status = searchParams.get('status')

  return {
    query: searchParams.get('search') ?? '',
    sort: sort === 'score-desc' || sort === 'score-asc' ? sort : 'newest',
    status: status === 'SUBMITTED' ||
      status === 'OFFERED' ||
      status === 'REJECTED' ||
      status === 'CANCELLED'
      ? status
      : 'all',
  }
}

function writeApplicationSearch(
  currentParams: URLSearchParams,
  criteria: RecruiterApplicationCriteria,
  applicationId?: string | null,
) {
  const nextParams = new URLSearchParams(currentParams)
  const query = criteria.query.trim()

  if (query) {
    nextParams.set('search', criteria.query)
  } else {
    nextParams.delete('search')
  }

  if (criteria.sort === 'newest') {
    nextParams.delete('sort')
  } else {
    nextParams.set('sort', criteria.sort)
  }

  if (criteria.status === 'all') {
    nextParams.delete('status')
  } else {
    nextParams.set('status', criteria.status)
  }

  if (applicationId === null) {
    nextParams.delete('applicationId')
  } else if (applicationId) {
    nextParams.set('applicationId', applicationId)
  }

  return nextParams
}

function isApplicationFinishedMatching(application: RecruiterApplicationItem | undefined) {
  return Boolean(application) && (application?.cvParseStatus === 'FAILED' || application?.matchScore !== null)
}

/**
 * Tier 2: CV list of one JD. This is the former single-tier page logic, moved
 * here and rewired onto the page-local data hooks. Only rendered by
 * `ApplicationJobAccessGuard` after access for `access.jobId` succeeded.
 */
export function ApplicationJobWorkspace({ access }: ApplicationJobWorkspaceProps) {
  const jobId = access.jobId
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const toast = useToast()
  const content = pages.recruiterApplications
  const [searchParams, setSearchParams] = useSearchParams()
  const criteria = useMemo(() => readApplicationCriteria(searchParams), [searchParams])
  const selectedApplicationId = searchParams.get('applicationId')?.trim() || null
  const criteriaKey = `${criteria.query}|${criteria.sort}|${criteria.status}`
  const [pageState, setPageState] = useState({ key: criteriaKey, page: 1 })
  const page = pageState.key === criteriaKey ? pageState.page : 1
  const [matchingApplicationIds, setMatchingApplicationIds] = useState<ReadonlySet<string>>(new Set())
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<ReadonlySet<string>>(new Set())
  const [isPollingPaused, setPollingPaused] = useState(false)
  const pollingStartedAtRef = useRef<number | null>(null)
  const [isPolling, setPolling] = useState(false)
  const refetchInterval = isPolling ? MATCH_POLL_INTERVAL_MS : false

  const applicationsRequest = useMemo(
    () => ({ criteria, limit: PAGE_SIZE, page }),
    [criteria, page],
  )
  const applicationsQuery = useJobApplications(jobId, applicationsRequest, { refetchInterval })
  const statsQuery = useJobApplicationStats(jobId, criteria.query)
  const detailQuery = useJobApplicationDetail(selectedApplicationId, { refetchInterval })
  const jobOptionsQuery = useApplicationJobOptions()
  const { applyUpdatedApplication, refreshDetail } = useJobApplicationsCache(jobId)

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )

  const formatDate = useCallback(
    (value: string) => {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? content.meta.notAvailable : dateFormatter.format(date)
    },
    [content.meta.notAvailable, dateFormatter],
  )

  const mapApplication = useCallback(
    (application: ApplicationResponse) =>
      createRecruiterApplicationFromApi(application, {
        formatDate,
        meta: content.meta,
      }),
    [content.meta, formatDate],
  )

  // Detail is only trusted when it belongs to this JD (data-level scoping).
  const detailApplication = useMemo(
    () => (detailQuery.data && detailQuery.data.jobId === jobId ? mapApplication(detailQuery.data) : null),
    [detailQuery.data, jobId, mapApplication],
  )

  const applications = useMemo(() => {
    const items = (applicationsQuery.data?.items ?? []).map(mapApplication)

    return detailApplication
      ? items.map((item) => (item.id === detailApplication.id ? detailApplication : item))
      : items
  }, [applicationsQuery.data, detailApplication, mapApplication])

  const selectedApplication = useMemo(() => {
    if (!selectedApplicationId) {
      return null
    }

    if (detailApplication?.id === selectedApplicationId) {
      return detailApplication
    }

    return applications.find((application) => application.id === selectedApplicationId) ?? null
  }, [applications, detailApplication, selectedApplicationId])

  const pendingMatchIds = useMemo(() => {
    const pendingIds = new Set<string>()

    for (const id of matchingApplicationIds) {
      const latest = detailApplication?.id === id
        ? detailApplication
        : applications.find((application) => application.id === id)

      if (!isApplicationFinishedMatching(latest)) {
        pendingIds.add(id)
      }
    }

    return pendingIds
  }, [applications, detailApplication, matchingApplicationIds])

  const shouldPoll = pendingMatchIds.size > 0 && !isPollingPaused

  useEffect(() => {
    setPolling(shouldPoll)

    if (!shouldPoll) {
      pollingStartedAtRef.current = null
      return undefined
    }

    pollingStartedAtRef.current ??= Date.now()
    const remainingMs = Math.max(0, MATCH_POLL_TIMEOUT_MS - (Date.now() - pollingStartedAtRef.current))
    const timeout = window.setTimeout(() => {
      setPollingPaused(true)
      setMatchingApplicationIds(new Set())
      toast.warning(content.match.timeout)
    }, remainingMs)

    return () => window.clearTimeout(timeout)
  }, [content.match.timeout, shouldPoll, toast])

  const isDetailForbidden = isForbiddenError(detailQuery.error)
  const detailErrorMessage = detailQuery.error && !isDetailForbidden
    ? getApiErrorEnvelope(detailQuery.error)?.error.message ?? content.states.detailError
    : null

  // A CV opened by URL outside my scope (403): same outcome as the JD guard, back to the JD list.
  useEffect(() => {
    if (isDetailForbidden) {
      toast.error(content.states.applicationForbidden)
      navigate(APPLICATION_JOBS_PATH, { replace: true })
    }
  }, [content.states.applicationForbidden, isDetailForbidden, navigate, toast])

  useEffect(() => {
    if (detailErrorMessage && !isPolling) {
      toast.error(detailErrorMessage)
    }
  }, [detailErrorMessage, detailQuery.errorUpdatedAt, isPolling, toast])

  const jobOptions = useMemo(() => {
    const options = jobOptionsQuery.data ?? []

    if (options.some((job) => job.id === jobId)) {
      return options
    }

    return [{ id: jobId, title: access.title }, ...options]
  }, [access.title, jobId, jobOptionsQuery.data])

  const totalPages = Math.max(1, applicationsQuery.data?.meta.totalPages ?? 1)
  const totalApplications = applicationsQuery.data?.meta.total ?? 0
  const hasActiveFilters = isActiveRecruiterApplicationFilters(criteria)
  const handledByLabel = content.handledBy

  useEffect(() => {
    if (page > totalPages) {
      setPageState({ key: criteriaKey, page: totalPages })
    }
  }, [criteriaKey, page, totalPages])

  function setPage(nextPage: number) {
    setPageState({ key: criteriaKey, page: nextPage })
  }

  function updateApplicationSearch(nextCriteria: RecruiterApplicationCriteria, applicationId?: string | null) {
    setSearchParams((currentParams) => writeApplicationSearch(currentParams, nextCriteria, applicationId), { replace: true })
  }

  function switchJob(nextJobId: string) {
    if (nextJobId === jobId) {
      return
    }

    const nextParams = writeApplicationSearch(searchParams, criteria, null)
    navigate(getJobApplicationsHref(nextJobId, nextParams))
  }

  function openApplicationDetail(applicationId: string) {
    updateApplicationSearch(criteria, applicationId)
  }

  function closeApplicationDetail() {
    updateApplicationSearch(criteria, null)
  }

  function openExternalUrl(url: string) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleApplicationAction(prefix: 'mailto' | 'resume', application: RecruiterApplicationItem) {
    if (prefix === 'mailto') {
      openExternalUrl(`mailto:${application.candidateEmail}?subject=Regarding%20your%20application`)
      return
    }

    try {
      const cvDownload = await fetchApplicationCv(application.id)
      openExternalUrl(cvDownload.url)
      void refreshDetail(application.id)
    } catch (error) {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.cvError)
    }
  }

  async function handleRunMatch(application: RecruiterApplicationItem) {
    setPollingPaused(false)
    setMatchingApplicationIds((currentIds) => new Set(currentIds).add(application.id))

    try {
      await requestApplicationMatch(application.id)
      toast.success(content.match.started)
      await refreshDetail(application.id)
    } catch (error) {
      setMatchingApplicationIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(application.id)
        return nextIds
      })
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.match.error)
    }
  }

  async function handleStatusChange(applicationId: string, status: RecruiterDecisionStatus, feedback: string) {
    setStatusUpdatingIds((currentIds) => new Set(currentIds).add(applicationId))

    try {
      const updatedApplication = await updateApplicationDecision(applicationId, status, feedback || null)
      void applyUpdatedApplication(updatedApplication)
      toast.success(content.states.statusSuccess)
      closeApplicationDetail()
      return true
    } catch (error) {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.statusError)
      return false
    } finally {
      setStatusUpdatingIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(applicationId)
        return nextIds
      })
    }
  }

  const tableHandlers = {
    onEmail: (application: RecruiterApplicationItem) => void handleApplicationAction('mailto', application),
    onOpenResume: (application: RecruiterApplicationItem) => void handleApplicationAction('resume', application),
    onView: (application: RecruiterApplicationItem) => openApplicationDetail(application.id),
  }

  function renderResults() {
    if (applicationsQuery.isPending) {
      return <ApplicationsStatePanel title={content.states.loading} />
    }

    if (applicationsQuery.isError && !applicationsQuery.data) {
      return (
        <ApplicationsStatePanel
          action={<Button onClick={() => void applicationsQuery.refetch()}>{content.states.retry}</Button>}
          description={getApiErrorEnvelope(applicationsQuery.error)?.error.message ?? content.states.errorDescription}
          role="alert"
          title={content.states.errorTitle}
        />
      )
    }

    if (applications.length === 0) {
      return (
        <ApplicationsStatePanel description={content.results.emptyDescription} title={content.results.emptyTitle} />
      )
    }

    return (
      <>
        <ApplicationTable
          actions={content.results}
          applications={applications}
          columns={content.results.columns}
          handledByLabel={handledByLabel}
          handlers={tableHandlers}
          matchLabels={content.match}
          statusLabels={content.statusLabels}
        />
        <ApplicationMobileList
          actions={content.results}
          applications={applications}
          columns={content.results.columns}
          handledByLabel={handledByLabel}
          handlers={tableHandlers}
          matchLabels={content.match}
          statusLabels={content.statusLabels}
        />
      </>
    )
  }

  return (
    <div className="recruiter-applications-page">
      <ApplicationJobHeader content={content.jobDetail} job={access} statusLabels={content.jobStatusLabels} />

      <ApplicationJobStats content={content.stats} stats={statsQuery.data ?? emptyApplicationStats} />

      <ApplicationFilters
        content={content.filters}
        hasActiveFilters={hasActiveFilters}
        jobId={jobId}
        jobLabel={content.jobDetail.jobSwitchLabel}
        jobs={jobOptions}
        onClear={() => updateApplicationSearch(defaultCriteria, null)}
        onJobChange={switchJob}
        onQueryChange={(value) => updateApplicationSearch({ ...criteria, query: value }, null)}
        onSortChange={(value) => updateApplicationSearch({ ...criteria, sort: value }, null)}
        onStatusChange={(value) => updateApplicationSearch({ ...criteria, status: value }, null)}
        query={criteria.query}
        sort={criteria.sort}
        status={criteria.status}
        statusLabels={content.statusLabels}
        tabs={content.tabs}
      />

      <section className="recruiter-applications-results">
        <header className="recruiter-applications-results__header">
          <p className="recruiter-applications-results__count">
            {content.results.countLabel.replace('{{count}}', String(totalApplications))}
          </p>
        </header>

        {renderResults()}
      </section>

      <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />

      {selectedApplication ? (
        <ApplicationDetailDrawer
          application={selectedApplication}
          handledByLabel={handledByLabel}
          isMatching={pendingMatchIds.has(selectedApplication.id)}
          isStatusUpdating={statusUpdatingIds.has(selectedApplication.id)}
          matchLabels={content.match}
          meta={content.meta}
          onClose={closeApplicationDetail}
          onEmail={(application) => void handleApplicationAction('mailto', application)}
          onOpenResume={(application) => void handleApplicationAction('resume', application)}
          onRunMatch={(application) => void handleRunMatch(application)}
          onStatusChange={handleStatusChange}
          statusLabels={content.statusLabels}
          translations={content.drawer}
        />
      ) : null}
    </div>
  )
}
