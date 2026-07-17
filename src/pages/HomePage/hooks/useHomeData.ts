import { useMemo } from 'react'
import { useLocale } from '../../../i18n'
import { useAsync } from '../../../hooks/useAsync'
import { categoryService } from '../../../services/category.service'
import { jobService } from '../../../services/job.service'
import type {
  CategoryView,
  FeaturedCompanyView,
  HeroStatView,
  IndustryGroupView,
  JobCardView,
} from '../types'
import {
  groupJobsByCategory,
  mapCategory,
  mapFeaturedCompany,
  mapHeroStats,
  mapJobToCard,
  type JobLabels,
} from '../utils/homeMappers'

const JOB_LIST_LIMIT = 8

export type HomeDataSection<TData> = {
  data: TData
  loading: boolean
  error: unknown
}

export type HomeData = {
  jobs: HomeDataSection<ReadonlyArray<JobCardView>>
  industryGroups: HomeDataSection<ReadonlyArray<IndustryGroupView>>
  companies: HomeDataSection<ReadonlyArray<FeaturedCompanyView>>
  categories: HomeDataSection<ReadonlyArray<CategoryView>>
  stats: HomeDataSection<ReadonlyArray<HeroStatView>>
}

export function useHomeData(): HomeData {
  const { locale, translations } = useLocale()
  const jobText = translations.common.job

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

  const jobsState = useAsync(
    () => jobService.getJobs({ limit: JOB_LIST_LIMIT, sort: 'latest' }),
    [],
  )
  const companiesState = useAsync(() => jobService.getFeaturedCompanies(6), [])
  const categoriesState = useAsync(() => categoryService.getCategories(), [])
  const statsState = useAsync(() => jobService.getHomeStats(), [])

  const jobCards = useMemo<ReadonlyArray<JobCardView>>(
    () => (jobsState.data?.data ?? []).map((job) => mapJobToCard(job, locale, jobLabels)),
    [jobsState.data, locale, jobLabels],
  )

  const categories = useMemo<ReadonlyArray<CategoryView>>(
    () => (categoriesState.data ?? []).map((category) => mapCategory(category, jobLabels)),
    [categoriesState.data, jobLabels],
  )

  const companies = useMemo<ReadonlyArray<FeaturedCompanyView>>(
    () => (companiesState.data ?? []).map((company) => mapFeaturedCompany(company, jobLabels)),
    [companiesState.data, jobLabels],
  )

  const stats = useMemo<ReadonlyArray<HeroStatView>>(
    () =>
      statsState.data
        ? mapHeroStats(statsState.data, locale, {
            openRoles: translations.pages.home.hero.stats.openRoles,
            companies: translations.pages.home.hero.stats.companies,
            categories: translations.pages.home.hero.stats.categories,
          })
        : [],
    [statsState.data, locale, translations.pages.home.hero.stats],
  )

  const industryGroups = useMemo<ReadonlyArray<IndustryGroupView>>(
    () => groupJobsByCategory(jobCards, categories),
    [jobCards, categories],
  )

  return {
    jobs: { data: jobCards, loading: jobsState.loading, error: jobsState.error },
    industryGroups: {
      data: industryGroups,
      loading: jobsState.loading || categoriesState.loading,
      error: jobsState.error ?? categoriesState.error,
    },
    companies: { data: companies, loading: companiesState.loading, error: companiesState.error },
    categories: { data: categories, loading: categoriesState.loading, error: categoriesState.error },
    stats: { data: stats, loading: statsState.loading, error: statsState.error },
  }
}
