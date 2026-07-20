import type { ProfileTranslations } from '../../../i18n/types'

type ApplicationEmptyStateProps = {
  content: ProfileTranslations['applications']['empty']
  onReset: () => void
}

export function ApplicationEmptyState({ content, onReset }: ApplicationEmptyStateProps) {
  return (
    <section className="profile-application-empty profile-card-motion">
      <span aria-hidden="true">0</span>
      <div>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <button onClick={onReset} type="button">
        {content.reset}
      </button>
    </section>
  )
}
