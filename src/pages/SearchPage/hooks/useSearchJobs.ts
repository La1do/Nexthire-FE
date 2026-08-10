import { useMemo } from 'react'
import { useLocale } from '../../../i18n'
import { useAsync } from '../../../hooks/useAsync'
import { categoryService } from '../../../services/category.service'
import { jobService } from '../../../services/job.service'
import { mapJobToCard, type JobLabels } from '../../HomePage/utils/homeMappers'
import type { JobCardView } from '../../HomePage/types'
import type { SearchQueryParams } from '../utils/searchParams'
import { toJobListQuery } from '../utils/searchQuery'

export type SearchFieldOption = {
  label: string
  value: string
}

export type SearchJobsData = {
  jobs: ReadonlyArray<JobCardView>
  total: number
  loading: boolean
  error: unknown
  fieldOptions: ReadonlyArray<SearchFieldOption>
}

export function useSearchJobs(params: SearchQueryParams): SearchJobsData {
  const { locale, translations } = useLocale()
  const jobText = translations.common.job

  const labels = useMemo<JobLabels>(
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

  const query = useMemo(() => toJobListQuery(params), [params])
  const queryKey = JSON.stringify(query)

  // oxlint-disable-next-line react/react-hooks/exhaustive-deps
  const jobsState = useAsync(() => jobService.getJobs(query), [queryKey])
  const categoriesState = useAsync(() => categoryService.getCategories(), [])

  const jobs = useMemo<ReadonlyArray<JobCardView>>(
    () => (jobsState.data?.data ?? []).map((job) => mapJobToCard(job, locale, labels)),
    [jobsState.data, locale, labels],
  )

  // Category filter options come from the live categories endpoint so the
  // `field` param carries a real categoryId the jobs API can filter on.
  const fieldOptions = useMemo<ReadonlyArray<SearchFieldOption>>(
    () => (categoriesState.data ?? []).map((category) => ({ label: category.name, value: category.id })),
    [categoriesState.data],
  )

  const total = jobsState.data?.meta.total ?? jobs.length

  return {
    jobs,
    total,
    loading: jobsState.loading,
    error: jobsState.error,
    fieldOptions,
  }
}
