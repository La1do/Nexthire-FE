import { useState } from 'react'
import type { HomeTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'

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

function LocationIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
}

type QuickFilterKey = 'remote' | 'hybrid' | 'senior' | 'salary25'

function detectQuickFilterKey(filter: string): QuickFilterKey | null {
  const lower = filter.toLowerCase()
  if (lower.includes('remote') || filter.includes('リモート')) return 'remote'
  if (lower.includes('hybrid') || filter.includes('ハイブリッド')) return 'hybrid'
  if (lower.includes('senior')) return 'senior'
  if (lower.includes('25')) return 'salary25'
  return null
}

function buildSearchParams(
  keyword: string,
  location: string,
  activeFilters: ReadonlySet<QuickFilterKey>,
) {
  const params = new URLSearchParams()

  if (keyword.trim()) {
    params.set('keyword', keyword.trim())
  }

  if (location.trim()) {
    params.set('location', location)
  }

  if (activeFilters.has('remote')) {
    params.set('workMode', 'Remote')
  } else if (activeFilters.has('hybrid')) {
    params.set('workMode', 'Hybrid')
  }

  if (activeFilters.has('senior')) {
    params.set('level', 'Senior')
  }

  if (activeFilters.has('salary25')) {
    params.set('salary', '25')
  }

  return params
}

export function JobSearchBar({ content }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [activeFilters, setActiveFilters] = useState<ReadonlySet<QuickFilterKey>>(() => new Set())

  function toggleFilter(key: QuickFilterKey) {
    setActiveFilters((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }

  const params = buildSearchParams(keyword, location, activeFilters)
  const action = params.toString() ? `/search?${params.toString()}` : '/search'

  return (
    <div className="job-search-shell">
      <form action={action} className="job-search-bar" method="get">
        <label className="job-search-field job-search-field-main">
          <span>{content.keywordLabel}</span>
          <SearchIcon />
          <input
            autoComplete="off"
            id="home-job-keyword"
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={content.keywordPlaceholder}
            type="search"
            value={keyword}
          />
        </label>

        <button className="job-search-submit" type="submit">
          {content.submit}
        </button>

        <div className="job-search-chips" aria-label={content.filterLabel}>
          <SelectField
            className="job-search-select-field"
            hideLabel
            icon={<LocationIcon />}
            id="home-job-location"
            label={content.locationLabel}
            name="location"
            onChange={setLocation}
            options={[
              { label: content.locationPlaceholder, value: '' },
              ...content.locationOptions.map((option) => ({ label: option, value: option })),
            ]}
            value={location}
          />

          {content.quickFilters.map((filter) => {
            const key = detectQuickFilterKey(filter)

            if (!key) {
              return null
            }

            const isActive = activeFilters.has(key)

            return (
              <button
                aria-pressed={isActive}
                className={`job-search-chip${isActive ? ' is-active' : ''}`}
                key={key}
                onClick={() => toggleFilter(key)}
                type="button"
              >
                {filter}
              </button>
            )
          })}
        </div>
      </form>
    </div>
  )
}
