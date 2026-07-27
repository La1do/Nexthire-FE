import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { applicationService } from '../../../services/application.service'
import { savedJobService } from '../../../services/savedJob.service'
import { useSavedJobsStore } from '../../../stores/savedJobs.store'
import type { ApplicationResponse, ApplicationStatus } from '../../../types/application.types'
import type { SavedJobItem, SavedJobListResponse, SavedJobStatus } from '../../../types/savedJob.types'
import { formatSalary } from '../../_utils/jobFormat'
import type {
  CandidateManagedJob,
  CandidateManagedJobFilter,
  CandidateManagedJobSort,
  CandidateManagedJobsStats,
  CandidateManagedJobTabCounts,
} from '../types'

type UseCandidateManagedJobsOptions = {
  fallbackLabel: string
  locale: string
  salaryNegotiableLabel: string
}

type CandidateManagedJobsState = {
  actionError: string | undefined
  error: string | undefined
  isLoading: boolean
  jobs: CandidateManagedJob[]
  removingSavedJobId: string | undefined
  stats: CandidateManagedJobsStats
  tabCounts: CandidateManagedJobTabCounts
  withdrawingApplicationId: string | undefined
}

type CandidateManagedJobsActions = {
  reload: () => Promise<void>
  removeSavedJob: (jobId: string, errorMessage: string) => Promise<void>
  withdrawApplication: (job: CandidateManagedJob, errorMessage: string) => Promise<void>
}

const PAGE_LIMIT = 100
const NEAR_DEADLINE_MS = 7 * 24 * 60 * 60 * 1000
const ACTIVE_APPLICATION_STATUSES = new Set<ApplicationStatus>(['SUBMITTED', 'OFFERED'])
const CLOSED_APPLICATION_STATUSES = new Set<ApplicationStatus>(['REJECTED', 'WITHDRAWN', 'CANCELLED'])
const UNAVAILABLE_JOB_STATUSES = new Set<SavedJobStatus>(['UNPUBLISHED', 'CLOSED', 'EXPIRED', 'REJECTED'])

function timestamp(value: string | null | undefined) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function isNearDeadline(deadline: string | null | undefined) {
  const deadlineTime = timestamp(deadline)
  if (!deadlineTime) return false
  const diff = deadlineTime - Date.now()
  return diff >= 0 && diff <= NEAR_DEADLINE_MS
}

function isUnavailableJobStatus(status: SavedJobStatus | undefined) {
  return Boolean(status && UNAVAILABLE_JOB_STATUSES.has(status))
}

function getSalarySortValue(job: SavedJobItem) {
  if (!job.isSalaryVisible) return 0
  return job.salaryMax ?? job.salaryMin ?? 0
}

function toSavedManagedJob(
  savedJob: SavedJobItem,
  { fallbackLabel, locale, salaryNegotiableLabel }: UseCandidateManagedJobsOptions,
): CandidateManagedJob {
  const companyName = savedJob.companyName ?? fallbackLabel
  const salaryLabel = formatSalary(
    {
      isSalaryVisible: savedJob.isSalaryVisible,
      salaryCurrency: savedJob.salaryCurrency,
      salaryMax: savedJob.salaryMax,
      salaryMin: savedJob.salaryMin,
    },
    locale,
    salaryNegotiableLabel,
  )

  return {
    companyId: savedJob.companyId,
    companyLogoUrl: savedJob.companyLogoUrl,
    companyName,
    deadline: savedJob.deadline,
    deadlineSortValue: timestamp(savedJob.deadline),
    isApplied: false,
    isSaved: true,
    jobId: savedJob.jobId,
    jobStatus: savedJob.status,
    location: savedJob.location || fallbackLabel,
    needsAttention: isNearDeadline(savedJob.deadline) || isUnavailableJobStatus(savedJob.status),
    salaryLabel,
    salarySortValue: getSalarySortValue(savedJob),
    savedAt: savedJob.savedAt,
    source: 'saved',
    title: savedJob.title,
  }
}

function toAppliedManagedJob(
  application: ApplicationResponse,
  fallbackLabel: string,
): CandidateManagedJob {
  return {
    appliedAt: application.submittedAt,
    applicationId: application.id,
    applicationStatus: application.status,
    companyId: application.companyId,
    companyLogoUrl: application.companyLogoUrl,
    companyName: application.companyName || fallbackLabel,
    deadlineSortValue: 0,
    isApplied: true,
    isSaved: false,
    jobId: application.jobId,
    location: fallbackLabel,
    needsAttention: application.status === 'OFFERED',
    salaryLabel: fallbackLabel,
    salarySortValue: 0,
    source: 'applied',
    title: application.jobTitle,
    updatedAt: application.updatedAt,
  }
}

function mergeApplicationIntoJob(job: CandidateManagedJob, application: ApplicationResponse): CandidateManagedJob {
  const applicationNeedsAttention = application.status === 'OFFERED'

  return {
    ...job,
    appliedAt: application.submittedAt,
    applicationId: application.id,
    applicationStatus: application.status,
    companyLogoUrl: job.companyLogoUrl ?? application.companyLogoUrl,
    companyName: job.companyName || application.companyName,
    isApplied: true,
    needsAttention: job.needsAttention || applicationNeedsAttention,
    updatedAt: application.updatedAt,
  }
}

function createCandidateManagedJobs(
  savedJobs: ReadonlyArray<SavedJobItem>,
  applications: ReadonlyArray<ApplicationResponse>,
  options: UseCandidateManagedJobsOptions,
) {
  const byJobId = new Map<string, CandidateManagedJob>()

  for (const savedJob of savedJobs) {
    byJobId.set(savedJob.jobId, toSavedManagedJob(savedJob, options))
  }

  for (const application of applications) {
    const currentJob = byJobId.get(application.jobId)

    if (currentJob) {
      byJobId.set(application.jobId, mergeApplicationIntoJob(currentJob, application))
    } else {
      byJobId.set(application.jobId, toAppliedManagedJob(application, options.fallbackLabel))
    }
  }

  return Array.from(byJobId.values())
}

function getLatestActivityTime(job: CandidateManagedJob) {
  return Math.max(timestamp(job.savedAt), timestamp(job.appliedAt), timestamp(job.updatedAt))
}

export function isCandidateManagedJobActive(job: CandidateManagedJob) {
  return Boolean(job.applicationStatus && ACTIVE_APPLICATION_STATUSES.has(job.applicationStatus))
}

export function isCandidateManagedJobClosed(job: CandidateManagedJob) {
  return Boolean(
    (job.applicationStatus && CLOSED_APPLICATION_STATUSES.has(job.applicationStatus)) ||
      isUnavailableJobStatus(job.jobStatus),
  )
}

export function filterCandidateManagedJobs(
  jobs: ReadonlyArray<CandidateManagedJob>,
  filter: CandidateManagedJobFilter,
  searchQuery: string,
) {
  const query = searchQuery.trim().toLowerCase()

  return jobs.filter((job) => {
    if (filter === 'saved' && !job.isSaved) return false
    if (filter === 'applied' && !job.isApplied) return false
    if (filter === 'active' && !isCandidateManagedJobActive(job)) return false
    if (filter === 'closed' && !isCandidateManagedJobClosed(job)) return false

    if (!query) return true

    const haystack = `${job.title} ${job.companyName} ${job.location}`.toLowerCase()
    return haystack.includes(query)
  })
}

export function sortCandidateManagedJobs(
  jobs: ReadonlyArray<CandidateManagedJob>,
  sort: CandidateManagedJobSort,
) {
  const nextJobs = [...jobs]

  nextJobs.sort((left, right) => {
    if (sort === 'deadline') {
      if (!left.deadlineSortValue && !right.deadlineSortValue) return getLatestActivityTime(right) - getLatestActivityTime(left)
      if (!left.deadlineSortValue) return 1
      if (!right.deadlineSortValue) return -1
      return left.deadlineSortValue - right.deadlineSortValue
    }

    if (sort === 'salary') {
      if (right.salarySortValue !== left.salarySortValue) return right.salarySortValue - left.salarySortValue
    }

    return getLatestActivityTime(right) - getLatestActivityTime(left)
  })

  return nextJobs
}

function getCandidateManagedJobsStats(jobs: ReadonlyArray<CandidateManagedJob>): CandidateManagedJobsStats {
  return jobs.reduce<CandidateManagedJobsStats>(
    (stats, job) => {
      if (job.isSaved) stats.saved += 1
      if (job.isApplied) stats.applied += 1
      if (isCandidateManagedJobActive(job)) stats.active += 1
      if (job.needsAttention) stats.needsAttention += 1
      return stats
    },
    { active: 0, applied: 0, needsAttention: 0, saved: 0 },
  )
}

function getCandidateManagedJobTabCounts(jobs: ReadonlyArray<CandidateManagedJob>): CandidateManagedJobTabCounts {
  return jobs.reduce<CandidateManagedJobTabCounts>(
    (counts, job) => {
      counts.all += 1
      if (job.isSaved) counts.saved += 1
      if (job.isApplied) counts.applied += 1
      if (isCandidateManagedJobActive(job)) counts.active += 1
      if (isCandidateManagedJobClosed(job)) counts.closed += 1
      return counts
    },
    { active: 0, all: 0, applied: 0, closed: 0, saved: 0 },
  )
}

async function loadAllSavedJobs() {
  const firstPage = await savedJobService.list({ limit: PAGE_LIMIT, page: 1 })
  const items = [...firstPage.data]
  await appendRemainingSavedJobs(items, firstPage)
  return items
}

async function appendRemainingSavedJobs(items: SavedJobItem[], firstPage: SavedJobListResponse) {
  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await savedJobService.list({ limit: PAGE_LIMIT, page })
    items.push(...response.data)
  }
}

async function loadAllApplications() {
  const firstPage = await applicationService.getMyApplications({ limit: PAGE_LIMIT, page: 1 })
  const items = [...firstPage.data]

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await applicationService.getMyApplications({ limit: PAGE_LIMIT, page })
    items.push(...response.data)
  }

  return items
}

export function useCandidateManagedJobs(
  options: UseCandidateManagedJobsOptions,
): CandidateManagedJobsState & CandidateManagedJobsActions {
  const hydrateSavedJobs = useSavedJobsStore((state) => state.hydrate)
  const addSavedJob = useSavedJobsStore((state) => state.add)
  const removeSavedJobFromStore = useSavedJobsStore((state) => state.remove)
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([])
  const [applications, setApplications] = useState<ApplicationResponse[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [actionError, setActionError] = useState<string | undefined>(undefined)
  const [removingSavedJobId, setRemovingSavedJobId] = useState<string | undefined>(undefined)
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState<string | undefined>(undefined)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    setActionError(undefined)

    try {
      const [nextSavedJobs, nextApplications] = await Promise.all([loadAllSavedJobs(), loadAllApplications()])
      hydrateSavedJobs(nextSavedJobs.map((job) => job.jobId))
      setSavedJobs(nextSavedJobs)
      setApplications(nextApplications)
    } catch (loadError) {
      setError(
        getApiErrorEnvelope(loadError)?.error.message ??
          (loadError instanceof Error ? loadError.message : 'LOAD_ERROR'),
      )
    } finally {
      setLoading(false)
    }
  }, [hydrateSavedJobs])

  useEffect(() => {
    void reload()
  }, [reload])

  const jobs = useMemo(
    () => createCandidateManagedJobs(savedJobs, applications, options),
    [applications, options, savedJobs],
  )
  const stats = useMemo(() => getCandidateManagedJobsStats(jobs), [jobs])
  const tabCounts = useMemo(() => getCandidateManagedJobTabCounts(jobs), [jobs])

  const removeSavedJob = useCallback(
    async (jobId: string, errorMessage: string) => {
      const previousSavedJobs = savedJobs
      setActionError(undefined)
      setRemovingSavedJobId(jobId)
      setSavedJobs((currentJobs) => currentJobs.filter((job) => job.jobId !== jobId))
      removeSavedJobFromStore(jobId)

      try {
        await savedJobService.remove(jobId)
      } catch (removeError) {
        setSavedJobs(previousSavedJobs)
        addSavedJob(jobId)
        setActionError(getApiErrorEnvelope(removeError)?.error.message ?? errorMessage)
      } finally {
        setRemovingSavedJobId(undefined)
      }
    },
    [addSavedJob, removeSavedJobFromStore, savedJobs],
  )

  const withdrawApplication = useCallback(async (job: CandidateManagedJob, errorMessage: string) => {
    if (!job.applicationId) return

    setActionError(undefined)
    setWithdrawingApplicationId(job.applicationId)

    try {
      const updatedApplication = await applicationService.withdrawMyApplication(job.applicationId)
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === updatedApplication.id ? updatedApplication : application,
        ),
      )
    } catch (withdrawError) {
      setActionError(getApiErrorEnvelope(withdrawError)?.error.message ?? errorMessage)
    } finally {
      setWithdrawingApplicationId(undefined)
    }
  }, [])

  return {
    actionError,
    error,
    isLoading,
    jobs,
    reload,
    removeSavedJob,
    removingSavedJobId,
    stats,
    tabCounts,
    withdrawApplication,
    withdrawingApplicationId,
  }
}
