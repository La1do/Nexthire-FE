import type { SearchTranslations } from '../../../i18n/types'
import type { SearchQueryParams } from '../utils/searchParams'

type SearchToolbarProps = {
  content: SearchTranslations['toolbar']
  locationOptions: ReadonlyArray<string>
  params: SearchQueryParams
}

export function SearchToolbar({ content, locationOptions, params }: SearchToolbarProps) {
  return (
    <section className="search-toolbar search-motion">
      <div>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
      </div>

      <form action="/search" className="search-toolbar-form" method="get">
        <input name="field" type="hidden" value={params.field} />
        <input name="salary" type="hidden" value={params.salary} />
        <input name="sort" type="hidden" value={params.sort} />
        <input name="workMode" type="hidden" value={params.workMode} />

        <label>
          <span>{content.keywordLabel}</span>
          <input
            autoComplete="off"
            defaultValue={params.keyword}
            name="keyword"
            placeholder={content.keywordPlaceholder}
            type="search"
          />
        </label>

        <label>
          <span>{content.locationLabel}</span>
          <select defaultValue={params.location} name="location">
            <option value="">{content.locationPlaceholder}</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">{content.submit}</button>
      </form>
    </section>
  )
}
