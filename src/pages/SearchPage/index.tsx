import { useMemo } from 'react'
import { useTranslations } from '../../i18n'
import { useSavedJobsHydrate } from '../../hooks/useSavedJobsHydrate'
import { EmptyState, Loading } from '../_components'
import { SearchEmptyState } from './components/SearchEmptyState'
import { SearchFilterPanel } from './components/SearchFilterPanel'
import { SearchResultCard } from './components/SearchResultCard'
import { SearchResultsHeader } from './components/SearchResultsHeader'
import { SearchToolbar } from './components/SearchToolbar'
import { useSearchJobs } from './hooks/useSearchJobs'
import { getSearchParams } from './utils/searchParams'

function getSearchString() {
  return typeof window === 'undefined' ? '' : window.location.search
}

export function SearchPage() {
  const { pages } = useTranslations()
  const home = pages.home
  const search = pages.search

  const searchString = getSearchString()
  const params = useMemo(() => getSearchParams(searchString), [searchString])

  const { jobs, total, loading, error, fieldOptions } = useSearchJobs(params)
  const locationOptions = home.hero.locationOptions

  const savedJobIds = useMemo(() => jobs.map((job) => job.id), [jobs])
  useSavedJobsHydrate(savedJobIds)

  return (
    <div className="search-page">
      <SearchToolbar content={search.toolbar} locationOptions={locationOptions} params={params} />

      <div className="search-layout">
        <SearchFilterPanel
          content={search.filters}
          fieldOptions={fieldOptions}
          locationOptions={locationOptions}
          params={params}
        />

        <section className="search-results search-motion">
          <SearchResultsHeader content={search.results} count={total} params={params} />

          {loading ? (
            <div className="search-state">
              <Loading label={search.results.loading} />
            </div>
          ) : error ? (
            <div className="search-state">
              <EmptyState description={search.results.errorDescription} title={search.results.errorTitle} />
            </div>
          ) : jobs.length ? (
            <div className="search-result-list">
              {jobs.map((job) => (
                <SearchResultCard job={job} key={job.id} labels={search.results} />
              ))}
            </div>
          ) : (
            <SearchEmptyState content={search.empty} />
          )}
        </section>
      </div>
    </div>
  )
}

export default SearchPage
