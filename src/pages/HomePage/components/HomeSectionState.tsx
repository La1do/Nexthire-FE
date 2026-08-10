import { EmptyState, Loading } from '../../_components'
import type { HomeTranslations } from '../../../i18n/types'

type HomeSectionStateProps = {
  states: HomeTranslations['states']
  loading: boolean
  error: unknown
  isEmpty: boolean
}

// Renders the shared loading / error / empty placeholder for a Home section.
// Returns null when there is data to show so the caller renders its content.
export function HomeSectionState({ states, loading, error, isEmpty }: HomeSectionStateProps) {
  if (loading) {
    return <Loading label={states.loading} />
  }

  if (error) {
    return <EmptyState description={states.errorDescription} title={states.errorTitle} />
  }

  if (isEmpty) {
    return <EmptyState description={states.emptyDescription} title={states.emptyTitle} />
  }

  return null
}
