import type { SearchTranslations } from '../../../i18n/types'
import type { SearchQueryParams } from '../utils/searchParams'

type SearchFilterPanelProps = {
  content: SearchTranslations['filters']
  locationOptions: ReadonlyArray<string>
  params: SearchQueryParams
}

export function SearchFilterPanel({ content, locationOptions, params }: SearchFilterPanelProps) {
  return (
    <aside className="search-filter-panel search-motion">
      <div className="search-filter-heading">
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>

      <form action="/search" className="search-filter-form" method="get">
        <input name="keyword" type="hidden" value={params.keyword} />
        <input name="sort" type="hidden" value={params.sort} />

        <label>
          <span>{content.locationLabel}</span>
          <select defaultValue={params.location} name="location">
            <option value="">{content.allOption}</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{content.fieldLabel}</span>
          <select defaultValue={params.field} name="field">
            <option value="">{content.allOption}</option>
            {content.fieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{content.workModeLabel}</span>
          <select defaultValue={params.workMode} name="workMode">
            <option value="">{content.allOption}</option>
            {content.workModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{content.salaryLabel}</span>
          <select defaultValue={params.salary} name="salary">
            <option value="">{content.allOption}</option>
            {content.salaryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="search-filter-actions">
          <a href="/search">{content.clear}</a>
          <button type="submit">{content.apply}</button>
        </div>
      </form>
    </aside>
  )
}
