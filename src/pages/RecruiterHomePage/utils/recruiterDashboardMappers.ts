import type { RecruiterHomeTranslations } from '../../../i18n/types'
import type { ApplicationResponse, ApplicationStatus } from '../../../types/application.types'
import type { CompanyResponse } from '../../../types/company.types'
import type { JobStatus } from '../../../types/job.types'
import type {
  RecruiterApplication,
  RecruiterCompany,
  RecruiterDashboardData,
  RecruiterPerformancePoint,
  RecruiterPipelineItem,
  RecruiterStat,
  RecruiterTask,
} from '../types'

export type JobStatusCounts = Partial<Record<JobStatus, number>>

export type RecruiterApplicationCounts = {
  candidateProfiles: number
  offered: number
  rejected: number
  submitted: number
  total: number
}

type RecruiterDashboardMapperInput = {
  applicationCounts: RecruiterApplicationCounts
  chartApplications: ReadonlyArray<ApplicationResponse>
  company: CompanyResponse | null
  content: RecruiterHomeTranslations
  jobStatusCounts: JobStatusCounts
  locale: string
  recentApplications: ReadonlyArray<ApplicationResponse>
}

function getCount(counts: JobStatusCounts, status: JobStatus) {
  return counts[status] ?? 0
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatShortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

function clean(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function replaceCount(template: string, count: number, locale: string) {
  return template.replace('{count}', formatNumber(count, locale))
}

function mapCompany(company: CompanyResponse | null, content: RecruiterHomeTranslations, locale: string): RecruiterCompany {
  if (!company) {
    return {
      id: null,
      address: '',
      completion: 0,
      description: '',
      logo: '',
      name: content.sidebar.currentRole,
      status: 'NO_COMPANY',
      submittedAt: '',
      taxCode: '',
      website: '',
    }
  }

  return {
    id: company.id,
    address: clean(company.address),
    completion: company.completionPercent,
    description: clean(company.description),
    logo: clean(company.logoUrl ?? company.logo),
    name: company.name,
    rejectionReason: clean(company.rejectionReason) || undefined,
    status: company.status,
    submittedAt: formatDate(company.submittedAt, locale),
    taxCode: company.taxCode,
    website: clean(company.website),
  }
}

function mapStats(
  counts: JobStatusCounts,
  applicationCounts: RecruiterApplicationCounts,
  content: RecruiterHomeTranslations,
  locale: string,
): ReadonlyArray<RecruiterStat> {
  const decidedApplications = applicationCounts.offered + applicationCounts.rejected
  const responseRate = applicationCounts.total > 0
    ? Math.round((decidedApplications / applicationCounts.total) * 100)
    : 0

  return [
    {
      id: 'candidateProfiles',
      delta: content.stats.cards.candidateProfiles.delta,
      href: '/recruiter/candidates',
      label: content.stats.cards.candidateProfiles.label,
      tone: 'blue',
      value: formatNumber(applicationCounts.candidateProfiles, locale),
    },
    {
      id: 'totalApplications',
      delta: content.stats.cards.totalApplications.delta,
      href: '/recruiter/applications',
      label: content.stats.cards.totalApplications.label,
      tone: 'green',
      value: formatNumber(applicationCounts.total, locale),
    },
    {
      id: 'activeJobs',
      delta: content.stats.cards.activeJobs.delta,
      href: '/recruiter/jobs',
      label: content.stats.cards.activeJobs.label,
      tone: 'amber',
      value: formatNumber(getCount(counts, 'PUBLISHED'), locale),
    },
    {
      id: 'newApplications',
      delta: content.stats.cards.newApplications.delta,
      href: '/recruiter/applications?status=SUBMITTED',
      label: content.stats.cards.newApplications.label,
      tone: 'green',
      value: formatNumber(applicationCounts.submitted, locale),
    },
    {
      id: 'responseRate',
      delta: content.stats.cards.responseRate.delta,
      label: content.stats.cards.responseRate.label,
      tone: 'coral',
      value: `${responseRate}%`,
    },
  ]
}

function getPendingJobCount(counts: JobStatusCounts) {
  return getCount(counts, 'PENDING_REVIEW') + getCount(counts, 'NEEDS_REVIEW') + getCount(counts, 'SHOULD_REJECT')
}

function mapPipeline(counts: JobStatusCounts, content: RecruiterHomeTranslations): ReadonlyArray<RecruiterPipelineItem> {
  return [
    { id: 'draft', count: getCount(counts, 'DRAFT'), label: content.pipeline.items.draft, tone: 'amber' },
    { id: 'pending', count: getPendingJobCount(counts), label: content.pipeline.items.pending, tone: 'coral' },
    { id: 'active', count: getCount(counts, 'PUBLISHED'), label: content.pipeline.items.active, tone: 'green' },
    { id: 'paused', count: getCount(counts, 'UNPUBLISHED'), label: content.pipeline.items.paused, tone: 'blue' },
  ]
}

function mapApplicationStatus(status: ApplicationStatus, content: RecruiterHomeTranslations) {
  return content.applications.statusLabels[status]
}

function mapApplications(
  applications: ReadonlyArray<ApplicationResponse>,
  content: RecruiterHomeTranslations,
  locale: string,
): ReadonlyArray<RecruiterApplication> {
  return applications.map((application) => ({
    id: application.id,
    candidateName: application.candidateFullName || application.candidateEmail,
    role: application.jobTitle,
    score: '-',
    stage: mapApplicationStatus(application.status, content),
    status: application.status,
    submittedAt: formatShortDate(application.submittedAt, locale),
  }))
}

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function mapPerformance(
  applications: ReadonlyArray<ApplicationResponse>,
  locale: string,
): ReadonlyArray<RecruiterPerformancePoint> {
  const today = new Date()
  const days = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - (5 - index))
    return date
  })
  const countsByDay = new Map(days.map((date) => [getDayKey(date), 0]))

  for (const application of applications) {
    const submittedAt = new Date(application.submittedAt)
    const key = getDayKey(submittedAt)

    if (countsByDay.has(key)) {
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
    }
  }

  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })

  return days.map((date) => {
    const count = countsByDay.get(getDayKey(date)) ?? 0

    return {
      id: getDayKey(date),
      count,
      label: dayFormatter.format(date),
    }
  })
}

function mapTasks(
  company: RecruiterCompany,
  counts: JobStatusCounts,
  applicationCounts: RecruiterApplicationCounts,
  content: RecruiterHomeTranslations,
  locale: string,
): ReadonlyArray<RecruiterTask> {
  const tasks: RecruiterTask[] = []
  const pendingJobs = getPendingJobCount(counts)

  if (company.status !== 'APPROVED') {
    tasks.push({
      id: 'verify-company',
      description: content.tasks.items.verifyCompany.description,
      label: content.tasks.items.verifyCompany.label,
      tone: 'coral',
    })
  }

  if (pendingJobs > 0) {
    tasks.push({
      id: 'pending-jobs',
      description: replaceCount(content.tasks.items.pendingJobs.description, pendingJobs, locale),
      label: content.tasks.items.pendingJobs.label,
      tone: 'amber',
    })
  }

  if (applicationCounts.submitted > 0) {
    tasks.push({
      id: 'reply-candidates',
      description: replaceCount(content.tasks.items.replyCandidates.description, applicationCounts.submitted, locale),
      label: content.tasks.items.replyCandidates.label,
      tone: 'green',
    })
  }

  return tasks
}

export function mapRecruiterDashboardData({
  applicationCounts,
  chartApplications,
  company: companyResponse,
  content,
  jobStatusCounts,
  locale,
  recentApplications,
}: RecruiterDashboardMapperInput): RecruiterDashboardData {
  const company = mapCompany(companyResponse, content, locale)

  return {
    applications: mapApplications(recentApplications, content, locale),
    company,
    performance: mapPerformance(chartApplications, locale),
    pipeline: mapPipeline(jobStatusCounts, content),
    stats: mapStats(jobStatusCounts, applicationCounts, content, locale),
    tasks: mapTasks(company, jobStatusCounts, applicationCounts, content, locale),
  }
}
