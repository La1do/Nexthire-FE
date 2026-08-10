import type { SearchTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type { SearchFieldOption } from '../hooks/useSearchJobs'
import type { SearchQueryParams } from '../utils/searchParams'

type SearchFilterPanelProps = {
  content: SearchTranslations['filters']
  fieldOptions: ReadonlyArray<SearchFieldOption>
  locationOptions: ReadonlyArray<string>
  params: SearchQueryParams
}

export function SearchFilterPanel({ content, fieldOptions, locationOptions, params }: SearchFilterPanelProps) {
  return (
    <aside className="search-filter-panel search-motion">
      <div className="search-filter-heading">
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>

      <form action="/search" className="search-filter-form" method="get">
        <input name="keyword" type="hidden" value={params.keyword} />
        <input name="sort" type="hidden" value={params.sort} />

        <SelectField
          defaultValue={params.location}
          label={content.locationLabel}
          name="location"
          options={[
            { label: content.allOption, value: '' },
            ...locationOptions.map((location) => ({ label: location, value: location })),
          ]}
        />

        <SelectField
          defaultValue={params.field}
          label={content.fieldLabel}
          name="field"
          options={[
            { label: content.allOption, value: '' },
            ...fieldOptions,
          ]}
        />

        <SelectField
          defaultValue={params.workMode}
          label={content.workModeLabel}
          name="workMode"
          options={[
            { label: content.allOption, value: '' },
            ...content.workModeOptions,
          ]}
        />

        <SelectField
          defaultValue={params.salary}
          label={content.salaryLabel}
          name="salary"
          options={[
            { label: content.allOption, value: '' },
            ...content.salaryOptions,
          ]}
        />

        <div className="search-filter-actions">
          <a href="/search">{content.clear}</a>
          <button type="submit">{content.apply}</button>
        </div>
      </form>
    </aside>
  )
}
