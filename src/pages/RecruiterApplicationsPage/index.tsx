import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../context'
import { useLocale, useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import { jobService } from '../../services/job.service'
import { InvalidMatchingStatusError, validateMatchingIdentity } from '../../types/matching-status.types'
import { pollMatchingStatus, validateMatchRequest } from './utils/pollMatchingStatus'
import { matchingCopy, type MatchingMessage } from './matchingCopy'
import type { ApplicationResponse } from '../../types/application.types'
import type { ApiMeta } from '../../types/job.types'
import { Button } from '../_components'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ApplicationDetailDrawer } from './components/ApplicationDetailDrawer'
import { ApplicationFilters } from './components/ApplicationFilters'
import { ApplicationMobileList } from './components/ApplicationMobileList'
import { ApplicationTable } from './components/ApplicationTable'
import type {
  RecruiterApplicationCriteria,
  RecruiterApplicationItem,
  RecruiterApplicationJobOption,
  RecruiterApplicationStats,
  RecruiterApplicationStatus,
} from './types'
import { createRecruiterApplicationFromApi } from './utils/recruiterApplicationApi'
import './recruiter-applications.css'
import {
  isActiveRecruiterApplicationFilters,
} from './utils/recruiterApplicationsFilters'

const PAGE_SIZE = 6
const MATCH_POLL_TIMEOUT_MS = 90_000
const emptyApplicationMeta: ApiMeta = { limit: PAGE_SIZE, page: 1, total: 0, totalPages: 1 }
const emptyApplicationStats: RecruiterApplicationStats = {
  interview: 0,
  new: 0,
  responseRate: '0%',
  total: 0,
}

type RecruiterDecisionStatus = Extract<RecruiterApplicationStatus, 'OFFERED' | 'REJECTED'>

function readApplicationCriteria(searchParams: URLSearchParams): RecruiterApplicationCriteria {
  const status = searchParams.get('status')

  return {
    jobId: searchParams.get('jobId')?.trim() || 'all',
    query: searchParams.get('search') ?? '',
    sort: 'newest',
    status: status === 'SUBMITTED' ||
      status === 'OFFERED' ||
      status === 'REJECTED' ||
      status === 'CANCELLED'
      ? status
      : 'all',
  }
}

function getApplicationQueryParams() {
  return { sortBy: 'submittedAt' as const, sortOrder: 'desc' as const }
}

function getApplicationCountQueryParams(criteria: RecruiterApplicationCriteria) {
  return {
    jobId: criteria.jobId === 'all' ? undefined : criteria.jobId,
    search: criteria.query.trim() || undefined,
  }
}

async function loadRecruiterJobOptions(): Promise<RecruiterApplicationJobOption[]> {
  const firstPage = await jobService.getRecruiterJobs({ limit: 100, page: 1 })
  const jobs = [...firstPage.data]

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await jobService.getRecruiterJobs({ limit: 100, page })
    jobs.push(...response.data)
  }

  return jobs.map((job) => ({ id: job.id, title: job.title }))
}

function ApplicationsIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
    </svg>
  )
}

function NewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function InterviewIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 8h10" />
      <path d="M7 12h6" />
      <path d="M4 5h16v11H9l-5 4V5Z" />
    </svg>
  )
}

function RateIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 19h16" />
      <path d="m7 15 3-3 3 2 4-6" />
      <path d="m16 8 1 0 0 1" />
    </svg>
  )
}

export function RecruiterApplicationsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const toast = useToast()
  const content = pages.recruiterApplications
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState<ReadonlyArray<RecruiterApplicationItem>>([])
  const [applicationMeta, setApplicationMeta] = useState<ApiMeta>(emptyApplicationMeta)
  const [applicationStats, setApplicationStats] = useState<RecruiterApplicationStats>(emptyApplicationStats)
  const [jobOptions, setJobOptions] = useState<ReadonlyArray<RecruiterApplicationJobOption>>([])
  const [criteria, setCriteria] = useState<RecruiterApplicationCriteria>(() => readApplicationCriteria(searchParams))
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [matchingApplicationIds, setMatchingApplicationIds] = useState<ReadonlySet<string>>(new Set())
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<ReadonlySet<string>>(new Set())
  const [page, setPage] = useState(1)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const matchingSessions = useRef(new Map<string, AbortController>())
  const [matchMessages, setMatchMessages] = useState<Record<string, MatchingMessage>>({})

  useEffect(() => {
    const sessions = matchingSessions.current
    return () => {
      for (const session of sessions.values()) session.abort()
      sessions.clear()
    }
  }, [])

  function matchingMessageFor(id: string) {
    const key = matchMessages[id]
    if (!key) return undefined
    return key === 'started' || key === 'timeout' || key === 'processingAction'
      ? content.match[key]
      : matchingCopy[locale][key]
  }

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

  const upsertMappedApplication = useCallback((application: RecruiterApplicationItem) => {
    setApplications((currentApplications) => {
      if (currentApplications.some((currentApplication) => currentApplication.id === application.id)) {
        return currentApplications.map((currentApplication) =>
          currentApplication.id === application.id ? application : currentApplication,
        )
      }

      return [application, ...currentApplications]
    })

    return application
  }, [])

  const loadApplications = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setLoading(true)
        setLoadError(undefined)
      }

      try {
        const response = await applicationService.getRecruiterApplications({
          ...getApplicationQueryParams(),
          jobId: criteria.jobId === 'all' ? undefined : criteria.jobId,
          limit: PAGE_SIZE,
          page,
          search: criteria.query.trim() || undefined,
          status: criteria.status === 'all' ? undefined : criteria.status,
        })
        const nextApplications = response.data.map(mapApplication)

        setApplications(nextApplications)
        setApplicationMeta(response.meta)
      } catch (error) {
        const errorMessage = getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription

        if (silent) {
          toast.error(errorMessage)
          return
        }

        setLoadError(errorMessage)
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [content.states.errorDescription, criteria, mapApplication, page, toast],
  )

  const loadApplicationStats = useCallback(async () => {
    try {
      const countParams = getApplicationCountQueryParams(criteria)
      const [total, submitted, offered, rejected] = await Promise.all([
        applicationService.getRecruiterApplications({ ...countParams, limit: 1, page: 1 }),
        applicationService.getRecruiterApplications({ ...countParams, limit: 1, page: 1, status: 'SUBMITTED' }),
        applicationService.getRecruiterApplications({ ...countParams, limit: 1, page: 1, status: 'OFFERED' }),
        applicationService.getRecruiterApplications({ ...countParams, limit: 1, page: 1, status: 'REJECTED' }),
      ])
      const responded = offered.meta.total + rejected.meta.total
      const responseRate = total.meta.total > 0 ? Math.round((responded / total.meta.total) * 100) : 0

      setApplicationStats({
        interview: responded,
        new: submitted.meta.total,
        responseRate: `${responseRate}%`,
        total: total.meta.total,
      })
    } catch {
      setApplicationStats(emptyApplicationStats)
    }
  }, [criteria])

  const refreshApplicationDetail = useCallback(
    async (applicationId: string, { silent = false }: { silent?: boolean } = {}) => {
      try {
        const application = await applicationService.getRecruiterApplication(applicationId)
        return upsertMappedApplication(mapApplication(application))
      } catch (error) {
        if (!silent) {
          toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.detailError)
        }

        return null
      }
    },
    [content.states.detailError, mapApplication, toast, upsertMappedApplication],
  )

  const jobs = useMemo(() => {
    if (criteria.jobId === 'all' || jobOptions.some((job) => job.id === criteria.jobId)) {
      return jobOptions
    }

    return [
      {
        id: criteria.jobId,
        title: content.filters.selectedJobFallback.replace('{{jobId}}', criteria.jobId),
      },
      ...jobOptions,
    ]
  }, [content.filters.selectedJobFallback, criteria.jobId, jobOptions])
  const totalPages = Math.max(1, applicationMeta.totalPages)
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  useEffect(() => {
    void loadApplicationStats()
  }, [loadApplicationStats])

  useEffect(() => {
    let ignore = false

    loadRecruiterJobOptions()
      .then((options) => {
        if (!ignore) {
          setJobOptions(options)
        }
      })
      .catch(() => {
        if (!ignore) {
          setJobOptions([])
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const nextCriteria = readApplicationCriteria(searchParams)

    setCriteria((current) => (
      current.jobId === nextCriteria.jobId &&
        current.query === nextCriteria.query &&
        current.sort === nextCriteria.sort &&
        current.status === nextCriteria.status
        ? current
        : nextCriteria
    ))
  }, [searchParams])

  useEffect(() => {
    if (selectedApplicationId) {
      void refreshApplicationDetail(selectedApplicationId)
    }
  }, [refreshApplicationDetail, selectedApplicationId])

  useEffect(() => {
    const applicationId = searchParams.get('applicationId')?.trim() ?? null

    if (applicationId && selectedApplicationId !== applicationId) {
      setSelectedApplicationId(applicationId)
      return
    }

    if (!applicationId && selectedApplicationId) {
      setSelectedApplicationId(null)
    }
  }, [searchParams, selectedApplicationId])

  useEffect(() => {
    setPage(1)
  }, [criteria.jobId, criteria.query, criteria.sort, criteria.status])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  const pagedApplications = applications
  const hasActiveFilters = isActiveRecruiterApplicationFilters(criteria)
  const selectedIndex = applications.findIndex((application) => application.id === selectedApplicationId)
  const hasPrevious = selectedIndex > 0
  const hasNext = selectedIndex >= 0 && selectedIndex < applications.length - 1

  function updateApplicationSearch(nextCriteria: RecruiterApplicationCriteria, applicationId?: string | null) {
    const criteriaChanged = criteria.jobId !== nextCriteria.jobId ||
      criteria.query !== nextCriteria.query ||
      criteria.sort !== nextCriteria.sort ||
      criteria.status !== nextCriteria.status

    if (criteriaChanged) {
      setPage(1)
    }

    setCriteria(nextCriteria)
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (nextCriteria.jobId === 'all') {
        nextParams.delete('jobId')
      } else {
        nextParams.set('jobId', nextCriteria.jobId)
      }

      if (nextCriteria.query.trim()) {
        nextParams.set('search', nextCriteria.query.trim())
      } else {
        nextParams.delete('search')
      }

      if (nextCriteria.sort === 'newest') {
        nextParams.delete('sort')
      } else {
        nextParams.set('sort', nextCriteria.sort)
      }

      if (nextCriteria.status === 'all') {
        nextParams.delete('status')
      } else {
        nextParams.set('status', nextCriteria.status)
      }

      if (applicationId === null) {
        nextParams.delete('applicationId')
      } else if (applicationId) {
        nextParams.set('applicationId', applicationId)
      }

      return nextParams
    }, { replace: true })
  }

  function openApplicationDetail(applicationId: string) {
    setSelectedApplicationId(applicationId)
    updateApplicationSearch(criteria, applicationId)
  }

  function closeApplicationDetail() {
    setSelectedApplicationId(null)
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
      const cvDownload = await applicationService.getRecruiterApplicationCv(application.id)
      openExternalUrl(cvDownload.url)
      void refreshApplicationDetail(application.id, { silent: true })
    } catch (error) {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.cvError)
    }
  }

  async function handleRunMatch(application: RecruiterApplicationItem) {
    if (matchingSessions.current.has(application.id)) return
    const session = new AbortController()
    matchingSessions.current.set(application.id, session)
    const timer = window.setTimeout(
      () => session.abort(new DOMException('Matching deadline', 'TimeoutError')),
      MATCH_POLL_TIMEOUT_MS,
    )
    const publish = (message: MatchingMessage) => {
      if (!session.signal.aborted) {
        setMatchMessages((current) => ({ ...current, [application.id]: message }))
      }
    }
    setMatchMessages((current) => ({ ...current, [application.id]: 'processingAction' }))
    setMatchingApplicationIds((current) => new Set(current).add(application.id))
    try {
      const current = await applicationService.getRecruiterApplication(application.id, session.signal)
      session.signal.throwIfAborted()
      if (current.id !== application.id || current.jobId !== application.jobId) {
        throw new InvalidMatchingStatusError('Application changed')
      }
      const identity = {
        applicationId: current.id,
        jobId: current.jobId,
        candidateId: current.candidateId,
        candidateCvId: current.candidateCvId,
      }
      const request = validateMatchRequest(
        await applicationService.runRecruiterApplicationMatch(application.id, session.signal),
        application.id,
      )
      session.signal.throwIfAborted()
      publish(request.id === null ? 'waitingCv' : 'started')
      let latestApplication = current
      const outcome = await pollMatchingStatus({
        identity,
        requestId: request.id,
        signal: session.signal,
        readApplication: async (signal) => {
          const updated = await applicationService.getRecruiterApplication(application.id, signal)
          validateMatchingIdentity({ ...updated, applicationId: updated.id }, identity)
          latestApplication = updated
          return updated
        },
        readStatus: (signal) => applicationService.getRecruiterApplicationMatchingStatus(application.id, signal),
      })
      session.signal.throwIfAborted()
      publish(outcome)
      upsertMappedApplication(mapApplication(latestApplication))
    } catch (error) {
      if (session.signal.aborted && session.signal.reason?.name !== 'TimeoutError') return
      const status = (error as { response?: { status?: number } } | null)?.response?.status
      const message: MatchingMessage = session.signal.aborted
        ? 'timeout'
        : error instanceof InvalidMatchingStatusError
          ? 'invalid'
          : status === 401 || status === 403 || status === 404
            ? 'denied'
            : 'network'
      setMatchMessages((current) => ({ ...current, [application.id]: message }))
    } finally {
      window.clearTimeout(timer)
      if (matchingSessions.current.get(application.id) === session) {
        matchingSessions.current.delete(application.id)
        setMatchingApplicationIds((current) => {
          const next = new Set(current)
          next.delete(application.id)
          return next
        })
      }
    }
  }

  async function handleStatusChange(applicationId: string, status: RecruiterDecisionStatus, feedback: string) {
    setStatusUpdatingIds((currentIds) => new Set(currentIds).add(applicationId))

    try {
      const updatedApplication = await applicationService.updateRecruiterApplicationStatus(applicationId, {
        note: feedback || null,
        status,
      })
      upsertMappedApplication(mapApplication(updatedApplication))
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

  if (isLoading && applications.length === 0) {
    return (
      <div className="recruiter-applications-page">
        <section className="recruiter-applications-empty">
          <p className="recruiter-applications-empty__title">{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="recruiter-applications-page">
        <section className="recruiter-applications-empty">
          <p className="recruiter-applications-empty__title">{content.states.errorTitle}</p>
          <p className="recruiter-applications-empty__description">{loadError}</p>
          <Button onClick={() => void loadApplications()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="recruiter-applications-page">
      <section className="recruiter-applications-hero">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h2>{content.hero.title}</h2>
          <p>{content.hero.description}</p>
        </div>
      </section>

      <section className="recruiter-applications-stats" aria-label={content.stats.title}>
        <AdminStatCard delta={content.stats.totalDelta} icon={<ApplicationsIcon />} label={content.stats.totalLabel} tone="blue" value={applicationStats.total} />
        <AdminStatCard delta={content.stats.newDelta} icon={<NewIcon />} label={content.stats.newLabel} tone="coral" value={applicationStats.new} />
        <AdminStatCard delta={content.stats.interviewDelta} icon={<InterviewIcon />} label={content.stats.interviewLabel} tone="amber" value={applicationStats.interview} />
        <AdminStatCard delta={content.stats.responseRateDelta} icon={<RateIcon />} label={content.stats.responseRateLabel} tone="violet" value={applicationStats.responseRate} />
      </section>

      <ApplicationFilters
        content={content.filters}
        hasActiveFilters={hasActiveFilters}
        jobId={criteria.jobId}
        jobs={jobs}
        onClear={() => {
          updateApplicationSearch({
            jobId: 'all',
            query: '',
            sort: 'newest',
            status: 'all',
          })
        }}
        onJobChange={(value) => updateApplicationSearch({ ...criteria, jobId: value }, null)}
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
            {content.results.countLabel.replace('{{count}}', String(applicationMeta.total))}
          </p>
        </header>

        {applications.length === 0 ? (
          <div className="recruiter-applications-empty">
            <p className="recruiter-applications-empty__title">{content.results.emptyTitle}</p>
            <p className="recruiter-applications-empty__description">{content.results.emptyDescription}</p>
          </div>
        ) : (
          <>
            <ApplicationTable
              actions={content.results}
              applications={pagedApplications}
              columns={content.results.columns}
              handlers={{
                onEmail: (application) => void handleApplicationAction('mailto', application),
                onOpenResume: (application) => void handleApplicationAction('resume', application),
                onView: (application) => openApplicationDetail(application.id),
              }}
              matchLabels={content.match}
              onSelectApplication={(application) => openApplicationDetail(application.id)}
              statusLabels={content.statusLabels}
            />
            <ApplicationMobileList
              actions={content.results}
              applications={pagedApplications}
              columns={content.results.columns}
              handlers={{
                onEmail: (application) => void handleApplicationAction('mailto', application),
                onOpenResume: (application) => void handleApplicationAction('resume', application),
                onView: (application) => openApplicationDetail(application.id),
              }}
              matchLabels={content.match}
              statusLabels={content.statusLabels}
            />
          </>
        )}
      </section>

      <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />

      {selectedApplication ? (
        <ApplicationDetailDrawer
          application={selectedApplication}
          applications={applications}
          currentIndex={selectedIndex >= 0 ? selectedIndex + 1 : undefined}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isMatching={matchingApplicationIds.has(selectedApplication.id)}
          isStatusUpdating={statusUpdatingIds.has(selectedApplication.id)}
          matchingMessage={matchingMessageFor(selectedApplication.id)}
          matchLabels={content.match}
          meta={content.meta}
          onClose={closeApplicationDetail}
          onEmail={(application) => void handleApplicationAction('mailto', application)}
          onNavigateNext={() => {
            if (hasNext) {
              openApplicationDetail(applications[selectedIndex + 1].id)
            }
          }}
          onNavigatePrevious={() => {
            if (hasPrevious) {
              openApplicationDetail(applications[selectedIndex - 1].id)
            }
          }}
          onOpenResume={(application) => void handleApplicationAction('resume', application)}
          onRunMatch={(application) => void handleRunMatch(application)}
          onSelectApplication={(app) => openApplicationDetail(app.id)}
          onStatusChange={handleStatusChange}
          statusLabels={content.statusLabels}
          totalCount={applications.length}
          translations={content.drawer}
        />
      ) : null}
    </div>
  )
}

export default RecruiterApplicationsPage
