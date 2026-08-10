import type { SearchTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type { SearchQueryParams } from '../utils/searchParams'
import { getActiveSearchValues } from '../utils/searchParams'

type SearchResultsHeaderProps = {
  content: SearchTranslations['results']
  count: number
  params: SearchQueryParams
}

export function SearchResultsHeader({ content, count, params }: SearchResultsHeaderProps) {
  const activeValues = getActiveSearchValues(params)
  const countLabel = content.countLabel.replace('{{count}}', String(count))

  return (
    <div className="search-results-header">
      <div>
        <p>{activeValues.length ? activeValues.join(' / ') : content.emptyQuery}</p>
        <h2>{content.title}</h2>
        <span>{countLabel}</span>
      </div>

      <form action="/search" className="search-sort-form" method="get">
        <input name="field" type="hidden" value={params.field} />
        <input name="keyword" type="hidden" value={params.keyword} />
        <input name="location" type="hidden" value={params.location} />
        <input name="salary" type="hidden" value={params.salary} />
        <input name="workMode" type="hidden" value={params.workMode} />
        <SelectField
          defaultValue={params.sort}
          label={content.sortLabel}
          name="sort"
          options={content.sortOptions}
        />
        <button type="submit">{content.sortLabel}</button>
      </form>
    </div>
  )
}
