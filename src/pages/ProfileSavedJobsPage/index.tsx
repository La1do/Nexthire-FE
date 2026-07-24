import { useTranslations } from '../../i18n'
import { Button } from '../_components'
import { SavedJobCard } from './components/SavedJobCard'
import { SavedJobsEmptyState } from './components/SavedJobsEmptyState'
import { useSavedJobsList } from './hooks/useSavedJobsList'
import type { ProfileSavedJobTranslations } from './types'

export function ProfileSavedJobsPage() {
  const { pages } = useTranslations()
  const content = pages.profile.savedJobs as unknown as ProfileSavedJobTranslations
  const profileMeta = pages.profile.applications.meta

  const state = useSavedJobsList()
  const items = state.data?.data ?? []

  if (state.loading) {
    return (
      <div className="saved-jobs-page">
        <section className="saved-jobs-state">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="saved-jobs-page">
        <section className="saved-jobs-state">
          <h2>{content.states.errorTitle}</h2>
          <p>{content.states.errorDescription}</p>
          <Button onClick={() => window.location.reload()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="saved-jobs-page">
      <section className="saved-jobs-hero">
        <div>
          <span>{content.routeLabel}</span>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>
        <a href="/search">{content.primaryAction}</a>
      </section>

      <section className="saved-jobs-list-panel">
        {items.length > 0 ? (
          <div className="saved-jobs-list">
            {items.map((item) => (
              <SavedJobCard
                item={item}
                key={item.id}
                labels={content.card}
                locationLabel={profileMeta.location}
                notAvailableLabel={profileMeta.notAvailable}
                salaryLabel={profileMeta.salary}
              />
            ))}
          </div>
        ) : (
          <SavedJobsEmptyState content={content.empty} />
        )}
      </section>
    </div>
  )
}

export default ProfileSavedJobsPage
