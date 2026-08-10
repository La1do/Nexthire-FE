import type { SearchTranslations } from '../../../i18n/types'

type SearchEmptyStateProps = {
  content: SearchTranslations['empty']
}

export function SearchEmptyState({ content }: SearchEmptyStateProps) {
  return (
    <div className="search-empty-state">
      <span aria-hidden="true">0</span>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <a href="/search">{content.action}</a>
    </div>
  )
}
