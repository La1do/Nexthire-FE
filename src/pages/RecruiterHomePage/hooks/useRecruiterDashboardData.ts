import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../context'
import { useLocale } from '../../../i18n'
import type { RecruiterHomeTranslations } from '../../../i18n/types'
import { getApiErrorCode } from '../../../lib/api/apiError'
import { applicationService } from '../../../services/application.service'
import { companyService } from '../../../services/company.service'
import { jobService } from '../../../services/job.service'
import type { ApplicationStatus } from '../../../types/application.types'
import type { CompanyResponse } from '../../../types/company.types'
import type { JobStatus } from '../../../types/job.types'
import type { RecruiterDashboardData } from '../types'
import {
  mapRecruiterDashboardData,
  type JobStatusCounts,
  type RecruiterApplicationCounts,
} from '../utils/recruiterDashboardMappers'

const JOB_COUNT_STATUSES: readonly JobStatus[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'NEEDS_REVIEW',
  'SHOULD_REJECT',
  'PUBLISHED',
  'UNPUBLISHED',
]

const APPLICATION_COUNT_STATUSES: readonly ApplicationStatus[] = ['SUBMITTED', 'OFFERED', 'REJECTED']

async function getMyCompanyOrNull(): Promise<CompanyResponse | null> {
  try {
    return await companyService.getMyCompany()
  } catch (error) {
    if (getApiErrorCode(error) === 'COMPANY.NOT_FOUND') {
      return null
    }

    throw error
  }
}

async function getJobStatusCounts(): Promise<JobStatusCounts> {
  const entries = await Promise.all(
    JOB_COUNT_STATUSES.map(async (status) => {
      const response = await jobService.getRecruiterJobs({ limit: 1, status })
      return [status, response.meta.total] as const
    }),
  )

  return Object.fromEntries(entries) as JobStatusCounts
}

async function getApplicationCounts(total: number): Promise<RecruiterApplicationCounts> {
  const entries = await Promise.all(
    APPLICATION_COUNT_STATUSES.map(async (status) => {
      const response = await applicationService.getRecruiterApplications({ limit: 1, status })
      return [status, response.meta.total] as const
    }),
  )
  const candidates = await applicationService.getRecruiterCandidates({ limit: 1, page: 1 })
  const counts = Object.fromEntries(entries) as Partial<Record<ApplicationStatus, number>>

  return {
    candidateProfiles: candidates.meta.total,
    offered: counts.OFFERED ?? 0,
    rejected: counts.REJECTED ?? 0,
    submitted: counts.SUBMITTED ?? 0,
    total,
  }
}

async function getRecruiterDashboardData(
  content: RecruiterHomeTranslations,
  locale: string,
): Promise<RecruiterDashboardData> {
  const company = await getMyCompanyOrNull()

  if (!company) {
    return mapRecruiterDashboardData({
      applicationCounts: { candidateProfiles: 0, offered: 0, rejected: 0, submitted: 0, total: 0 },
      chartApplications: [],
      company,
      content,
      jobStatusCounts: {},
      locale,
      recentApplications: [],
    })
  }

  const [jobStatusCounts, recentApplications, chartApplications] = await Promise.all([
    getJobStatusCounts(),
    applicationService.getRecruiterApplications({ limit: 3 }),
    applicationService.getRecruiterApplications({ limit: 100 }),
  ])
  const applicationCounts = await getApplicationCounts(chartApplications.meta.total)

  return mapRecruiterDashboardData({
    applicationCounts,
    chartApplications: chartApplications.data,
    company,
    content,
    jobStatusCounts,
    locale,
    recentApplications: recentApplications.data,
  })
}

export function useRecruiterDashboardData() {
  const { user } = useAuth()
  const { locale, translations } = useLocale()
  const content = translations.pages.recruiterHome
  const query = useQuery({
    queryFn: () => getRecruiterDashboardData(content, locale),
    queryKey: ['recruiter-dashboard', user?.id ?? 'anonymous', locale],
  })

  return {
    data: query.data,
    error: query.error,
    loading: query.isPending || query.isFetching,
    refresh: query.refetch,
  }
}
