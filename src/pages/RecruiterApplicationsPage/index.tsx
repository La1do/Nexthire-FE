import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../context'
import { useLocale, useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import type { ApplicationResponse } from '../../types/application.types'
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
  RecruiterApplicationStatus,
} from './types'
import { createRecruiterApplicationFromApi } from './utils/recruiterApplicationApi'
import { computeRecruiterApplicationStats } from './utils/recruiterApplicationsData'
import './recruiter-applications.css'
import {
  filterRecruiterApplications,
  getRecruiterApplicationJobs,
  isActiveRecruiterApplicationFilters,
} from './utils/recruiterApplicationsFilters'

const PAGE_SIZE = 6
const MATCH_POLL_INTERVAL_MS = 4_000
const MATCH_POLL_TIMEOUT_MS = 90_000

type RecruiterDecisionStatus = Extract<RecruiterApplicationStatus, 'OFFERED' | 'REJECTED'>

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

function isApplicationPolling(application: RecruiterApplicationItem, matchingIds: ReadonlySet<string>) {
  if (application.cvParseStatus === 'PARSING') {
    return true
  }

  return matchingIds.has(application.id) && application.cvParseStatus !== 'FAILED' && application.matchScore === null
}

export function RecruiterApplicationsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const toast = useToast()
  const content = pages.recruiterApplications
  const [applications, setApplications] = useState<ReadonlyArray<RecruiterApplicationItem>>([])
  const [criteria, setCriteria] = useState<RecruiterApplicationCriteria>({
    jobId: 'all',
    query: '',
    sort: 'newest',
    status: 'all',
  })
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [matchingApplicationIds, setMatchingApplicationIds] = useState<ReadonlySet<string>>(new Set())
  const [statusUpdatingIds, setStatusUpdatingIds] = useState<ReadonlySet<string>>(new Set())
  const [isPollingPaused, setPollingPaused] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const pollingStartedAtRef = useRef<number | null>(null)

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

    setMatchingApplicationIds((currentIds) => {
      if (!currentIds.has(application.id)) {
        return currentIds
      }

      if (application.cvParseStatus === 'FAILED' || application.matchScore !== null) {
        const nextIds = new Set(currentIds)
        nextIds.delete(application.id)
        return nextIds
      }

      return currentIds
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
        const response = await applicationService.getRecruiterApplications({ limit: 50, page: 1 })
        const nextApplications = response.data.map(mapApplication)

        setApplications(nextApplications)
        setMatchingApplicationIds((currentIds) => {
          const nextIds = new Set<string>()

          for (const id of currentIds) {
            const application = nextApplications.find((item) => item.id === id)

            if (application && application.cvParseStatus !== 'FAILED' && application.matchScore === null) {
              nextIds.add(id)
            }
          }

          return nextIds
        })
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
    [content.states.errorDescription, mapApplication, toast],
  )

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

  const stats = useMemo(() => computeRecruiterApplicationStats(applications), [applications])
  const jobs = useMemo(() => getRecruiterApplicationJobs(applications), [applications])
  const filtered = useMemo(
    () => filterRecruiterApplications(applications, criteria),
    [applications, criteria],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )
  const hasPollingApplications = useMemo(
    () => applications.some((application) => isApplicationPolling(application, matchingApplicationIds)),
    [applications, matchingApplicationIds],
  )

  useEffect(() => {
    void loadApplications()
  }, [loadApplications])

  useEffect(() => {
    if (selectedApplicationId) {
      void refreshApplicationDetail(selectedApplicationId)
    }
  }, [refreshApplicationDetail, selectedApplicationId])

  useEffect(() => {
    setPage(1)
  }, [criteria.jobId, criteria.query, criteria.sort, criteria.status])

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages))
  }, [totalPages])

  useEffect(() => {
    if (selectedApplicationId && !applications.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(null)
    }
  }, [applications, selectedApplicationId])

  useEffect(() => {
    if (selectedApplicationId && !filtered.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(null)
    }
  }, [filtered, selectedApplicationId])

  useEffect(() => {
    if (!hasPollingApplications || isPollingPaused) {
      pollingStartedAtRef.current = null
      return undefined
    }

    pollingStartedAtRef.current ??= Date.now()

    const interval = window.setInterval(() => {
      const startedAt = pollingStartedAtRef.current ?? Date.now()

      if (Date.now() - startedAt > MATCH_POLL_TIMEOUT_MS) {
        setPollingPaused(true)
        setMatchingApplicationIds(new Set())
        toast.warning(content.match.timeout)
        return
      }

      void loadApplications({ silent: true })

      if (selectedApplicationId) {
        void refreshApplicationDetail(selectedApplicationId, { silent: true })
      }
    }, MATCH_POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [
    content.match.timeout,
    hasPollingApplications,
    isPollingPaused,
    loadApplications,
    refreshApplicationDetail,
    selectedApplicationId,
    toast,
  ])

  const pagedApplications = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasActiveFilters = isActiveRecruiterApplicationFilters(criteria)

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
    setPollingPaused(false)
    setMatchingApplicationIds((currentIds) => new Set(currentIds).add(application.id))

    try {
      await applicationService.runRecruiterApplicationMatch(application.id)
      toast.success(content.match.started)
      await refreshApplicationDetail(application.id, { silent: true })
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
      const updatedApplication = await applicationService.updateRecruiterApplicationStatus(applicationId, {
        note: feedback || null,
        status,
      })
      upsertMappedApplication(mapApplication(updatedApplication))
      toast.success(content.states.statusSuccess)
      setSelectedApplicationId(null)
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

  if (isLoading) {
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
        <AdminStatCard delta={content.stats.totalDelta} icon={<ApplicationsIcon />} label={content.stats.totalLabel} tone="blue" value={stats.total} />
        <AdminStatCard delta={content.stats.newDelta} icon={<NewIcon />} label={content.stats.newLabel} tone="coral" value={stats.new} />
        <AdminStatCard delta={content.stats.interviewDelta} icon={<InterviewIcon />} label={content.stats.interviewLabel} tone="amber" value={stats.interview} />
        <AdminStatCard delta={content.stats.responseRateDelta} icon={<RateIcon />} label={content.stats.responseRateLabel} tone="violet" value={stats.responseRate} />
      </section>

      <ApplicationFilters
        content={content.filters}
        hasActiveFilters={hasActiveFilters}
        jobId={criteria.jobId}
        jobs={jobs}
        onClear={() => {
          setCriteria({
            jobId: 'all',
            query: '',
            sort: 'newest',
            status: 'all',
          })
        }}
        onJobChange={(value) => setCriteria((current) => ({ ...current, jobId: value }))}
        onQueryChange={(value) => setCriteria((current) => ({ ...current, query: value }))}
        onSortChange={(value) => setCriteria((current) => ({ ...current, sort: value }))}
        onStatusChange={(value) => setCriteria((current) => ({ ...current, status: value }))}
        query={criteria.query}
        sort={criteria.sort}
        status={criteria.status}
        statusLabels={content.statusLabels}
        tabs={content.tabs}
      />

      <section className="recruiter-applications-results">
        <header className="recruiter-applications-results__header">
          <p className="recruiter-applications-results__count">
            {content.results.countLabel.replace('{{count}}', String(filtered.length))}
          </p>
        </header>

        {filtered.length === 0 ? (
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
                onView: (application) => setSelectedApplicationId(application.id),
              }}
              matchLabels={content.match}
              statusLabels={content.statusLabels}
            />
            <ApplicationMobileList
              actions={content.results}
              applications={pagedApplications}
              columns={content.results.columns}
              handlers={{
                onEmail: (application) => void handleApplicationAction('mailto', application),
                onOpenResume: (application) => void handleApplicationAction('resume', application),
                onView: (application) => setSelectedApplicationId(application.id),
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
          isMatching={matchingApplicationIds.has(selectedApplication.id)}
          isStatusUpdating={statusUpdatingIds.has(selectedApplication.id)}
          matchLabels={content.match}
          meta={content.meta}
          onClose={() => setSelectedApplicationId(null)}
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

export default RecruiterApplicationsPage
