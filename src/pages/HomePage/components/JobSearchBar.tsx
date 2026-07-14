import type { HomeTranslations } from '../../../i18n/types'

type JobSearchBarProps = {
  content: HomeTranslations['hero']
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

function getQuickFilterHref(filter: string) {
  const params = new URLSearchParams()
  const normalizedFilter = filter.toLowerCase()

  if (normalizedFilter.includes('remote') || filter.includes('リモート')) {
    params.set('workMode', filter.includes('リモート') ? 'リモート' : 'Remote')
  } else if (normalizedFilter.includes('hybrid') || filter.includes('ハイブリッド')) {
    params.set('workMode', filter.includes('ハイブリッド') ? 'ハイブリッド' : 'Hybrid')
  } else if (normalizedFilter.includes('25')) {
    params.set('salary', '25')
  } else {
    params.set('keyword', filter)
  }

  return `/search?${params.toString()}`
}

export function JobSearchBar({ content }: JobSearchBarProps) {
  return (
    <div className="job-search-shell">
      <form action="/search" className="job-search-bar" method="get">
        <label className="job-search-field job-search-field-main">
          <span>{content.keywordLabel}</span>
          <SearchIcon />
          <input autoComplete="off" id="home-job-keyword" name="keyword" placeholder={content.keywordPlaceholder} type="search" />
        </label>

        <div className="job-search-divider" />

        <label className="job-search-field job-search-field-location">
          <span>{content.locationLabel}</span>
          <LocationIcon />
          <select defaultValue="" id="home-job-location" name="location">
            <option value="">{content.locationPlaceholder}</option>
            {content.locationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button aria-label={content.filterLabel} className="job-search-filter" name="filters" type="submit" value="open">
          <FilterIcon />
        </button>

        <button className="job-search-submit" type="submit">
          {content.submit}
        </button>
      </form>

      <div className="job-search-chips" aria-label={content.filterLabel}>
        {content.quickFilters.map((filter) => (
          <a href={getQuickFilterHref(filter)} key={filter}>
            {filter}
          </a>
        ))}
      </div>
    </div>
  )
}
