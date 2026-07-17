import { useTranslations } from '../../i18n'
import { SearchEmptyState } from './components/SearchEmptyState'
import { SearchFilterPanel } from './components/SearchFilterPanel'
import { SearchResultCard } from './components/SearchResultCard'
import { SearchResultsHeader } from './components/SearchResultsHeader'
import { SearchToolbar } from './components/SearchToolbar'
import { filterSearchJobs, getUniqueJobs, sortSearchJobs } from './utils/searchFilters'
import { getSearchParams } from './utils/searchParams'

function getSearchString() {
  return typeof window === 'undefined' ? '' : window.location.search
}

export function SearchPage() {
  const { pages } = useTranslations()
  const home = pages.home
  const search = pages.search
  const params = getSearchParams(getSearchString())
  const allJobs = getUniqueJobs([
    ...home.jobs.items,
    ...home.industryJobs.groups.flatMap((group) => group.jobs),
  ])
  const locationOptions = Array.from(new Set([...home.hero.locationOptions, ...allJobs.map((job) => job.location)]))
  const filteredJobs = sortSearchJobs(filterSearchJobs(allJobs, params), params.sort)

  return (
    <div className="search-page">
      <SearchToolbar content={search.toolbar} locationOptions={locationOptions} params={params} />

      <div className="search-layout">
        <SearchFilterPanel content={search.filters} locationOptions={locationOptions} params={params} />

        <section className="search-results search-motion">
          <SearchResultsHeader content={search.results} count={filteredJobs.length} params={params} />

          {filteredJobs.length ? (
            <div className="search-result-list">
              {filteredJobs.map((job) => (
                <SearchResultCard job={job} key={`${job.company}-${job.title}`} labels={search.results} />
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
