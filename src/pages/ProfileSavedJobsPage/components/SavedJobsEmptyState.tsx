import type { ProfileSavedJobTranslations } from '../types'

type SavedJobsEmptyStateProps = {
  content: ProfileSavedJobTranslations['empty']
}

export function SavedJobsEmptyState({ content }: SavedJobsEmptyStateProps) {
  return (
    <section className="saved-jobs-empty">
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <a href="/search">{content.action}</a>
    </section>
  )
}
