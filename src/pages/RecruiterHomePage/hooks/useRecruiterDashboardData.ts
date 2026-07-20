import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../../../i18n'
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

type RecruiterDashboardState = {
  data: RecruiterDashboardData | undefined
  error: unknown
  loading: boolean
}

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
  const counts = Object.fromEntries(entries) as Partial<Record<ApplicationStatus, number>>

  return {
    offered: counts.OFFERED ?? 0,
    rejected: counts.REJECTED ?? 0,
    submitted: counts.SUBMITTED ?? 0,
    total,
  }
}

export function useRecruiterDashboardData() {
  const { locale, translations } = useLocale()
  const content = translations.pages.recruiterHome
  const requestIdRef = useRef(0)
  const [state, setState] = useState<RecruiterDashboardState>({
    data: undefined,
    error: undefined,
    loading: true,
  })

  const refresh = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setState((current) => ({ ...current, error: undefined, loading: true }))

    try {
      const company = await getMyCompanyOrNull()

      if (!company) {
        const data = mapRecruiterDashboardData({
          applicationCounts: { offered: 0, rejected: 0, submitted: 0, total: 0 },
          chartApplications: [],
          company,
          content,
          jobStatusCounts: {},
          locale,
          recentApplications: [],
        })

        if (requestIdRef.current === requestId) {
          setState({ data, error: undefined, loading: false })
        }
        return
      }

      const [jobStatusCounts, recentApplications, chartApplications] = await Promise.all([
        getJobStatusCounts(),
        applicationService.getRecruiterApplications({ limit: 3 }),
        applicationService.getRecruiterApplications({ limit: 100 }),
      ])
      const applicationCounts = await getApplicationCounts(chartApplications.meta.total)
      const data = mapRecruiterDashboardData({
        applicationCounts,
        chartApplications: chartApplications.data,
        company,
        content,
        jobStatusCounts,
        locale,
        recentApplications: recentApplications.data,
      })

      if (requestIdRef.current === requestId) {
        setState({ data, error: undefined, loading: false })
      }
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setState({ data: undefined, error, loading: false })
      }
    }
  }, [content, locale])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    ...state,
    refresh,
  }
}
