import { useMemo } from 'react'
import { useLocale } from '../../../i18n'
import { useAsync } from '../../../hooks/useAsync'
import { getApiErrorCode } from '../../../lib/api/apiError'
import { companyService } from '../../../services/company.service'
import { jobService } from '../../../services/job.service'
import type { JobLabels } from '../../HomePage/utils/homeMappers'
import { mapCompanyDetail, type CompanyDetailViewModel } from '../utils/companyDetailMappers'

const OPEN_JOBS_LIMIT = 6

// Company does not exist / not approved, or the id is malformed → 404 state.
const NOT_FOUND_CODES = new Set(['COMPANY.NOT_FOUND', 'COMMON.VALIDATION_ERROR'])

export type CompanyDetailData = {
  company: CompanyDetailViewModel | null
  loading: boolean
  error: unknown
  notFound: boolean
}

export function useCompanyDetail(id: string): CompanyDetailData {
  const { locale, translations } = useLocale()
  const jobText = translations.common.job
  const fallback = translations.pages.companyDetail.fallbackProfile

  const jobLabels = useMemo<JobLabels>(
    () => ({
      workingType: jobText.workingType,
      salaryNegotiable: jobText.salaryNegotiable,
      jobsCountSuffix: jobText.jobsCountSuffix,
      rolesCountSuffix: jobText.rolesCountSuffix,
      postedJustNow: jobText.postedJustNow,
      postedPrefix: jobText.postedPrefix,
      postedSuffix: jobText.postedSuffix,
    }),
    [jobText],
  )

  const companyState = useAsync(() => companyService.getPublicCompany(id), [id])
  const jobsState = useAsync(
    () => jobService.getJobsByCompany(id, { limit: OPEN_JOBS_LIMIT, sort: 'latest' }),
    [id],
  )

  const profile = companyState.data
  const openJobsData = jobsState.data

  const company = useMemo<CompanyDetailViewModel | null>(
    () =>
      profile
        ? mapCompanyDetail(profile, openJobsData?.data ?? [], fallback, locale, jobLabels)
        : null,
    [profile, openJobsData, fallback, locale, jobLabels],
  )

  const notFound =
    Boolean(companyState.error) && NOT_FOUND_CODES.has(getApiErrorCode(companyState.error) ?? '')

  return {
    company,
    loading: companyState.loading,
    error: notFound ? undefined : companyState.error,
    notFound,
  }
}
