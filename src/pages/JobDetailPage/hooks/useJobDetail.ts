import { useMemo } from 'react'
import { useLocale } from '../../../i18n'
import { useAsync } from '../../../hooks/useAsync'
import { getApiErrorCode } from '../../../lib/api/apiError'
import { jobService } from '../../../services/job.service'
import type { JobDetailSectionView, JobDetailView, RelatedJobView } from '../types'
import {
  mapJobDetail,
  mapJobDetailSections,
  mapRelatedJob,
  type JobDetailLabels,
} from '../utils/jobDetailMappers'

const RELATED_FETCH_LIMIT = 4
const RELATED_DISPLAY_LIMIT = 3

// Error codes that mean "there is no public job here" — render the 404 state
// instead of a generic error. See BE api-docs/job-service.md.
const NOT_FOUND_CODES = new Set(['JOB.JOB_NOT_PUBLIC', 'COMMON.VALIDATION_ERROR'])

export type JobDetailData = {
  job: JobDetailView | null
  sections: ReadonlyArray<JobDetailSectionView>
  related: ReadonlyArray<RelatedJobView>
  loading: boolean
  error: unknown
  notFound: boolean
}

export function useJobDetail(id: string): JobDetailData {
  const { locale, translations } = useLocale()
  const jobText = translations.common.job
  const content = translations.pages.jobDetail

  const labels = useMemo<JobDetailLabels>(
    () => ({
      workingType: jobText.workingType,
      salaryNegotiable: jobText.salaryNegotiable,
      postedJustNow: jobText.postedJustNow,
      postedPrefix: jobText.postedPrefix,
      postedSuffix: jobText.postedSuffix,
    }),
    [jobText],
  )

  const jobState = useAsync(() => jobService.getJobById(id), [id])
  const raw = jobState.data

  const job = useMemo<JobDetailView | null>(
    () => (raw ? mapJobDetail(raw, locale, labels) : null),
    [raw, locale, labels],
  )

  const sections = useMemo<ReadonlyArray<JobDetailSectionView>>(
    () => (raw ? mapJobDetailSections(raw, content.sections) : []),
    [raw, content.sections],
  )

  // Related jobs share the current job's category. Skip the call until we know
  // the category so we don't fetch an unrelated list on first render.
  const categoryId = raw?.categoryId ?? null
  const relatedState = useAsync(
    () =>
      categoryId
        ? jobService.getJobs({ categoryId, limit: RELATED_FETCH_LIMIT, sort: 'latest' })
        : Promise.resolve(null),
    [categoryId],
  )

  const related = useMemo<ReadonlyArray<RelatedJobView>>(() => {
    const items = relatedState.data?.data ?? []
    return items
      .filter((item) => item.id !== id)
      .slice(0, RELATED_DISPLAY_LIMIT)
      .map(mapRelatedJob)
  }, [relatedState.data, id])

  const notFound = Boolean(jobState.error) && NOT_FOUND_CODES.has(getApiErrorCode(jobState.error) ?? '')

  return {
    job,
    sections,
    related,
    loading: jobState.loading,
    error: notFound ? undefined : jobState.error,
    notFound,
  }
}
