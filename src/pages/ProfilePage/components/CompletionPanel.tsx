import type { ProfileTranslations } from '../../../i18n/types'
import type { ProfileCompletion } from '../types'

type CompletionPanelProps = {
  completion: ProfileCompletion
  content: ProfileTranslations['completion']
}

export function CompletionPanel({ completion, content }: CompletionPanelProps) {
  return (
    <aside className="profile-completion-panel profile-card-motion">
      <div>
        <span>{completion.percent}%</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </div>

      <ul>
        {completion.items.map((item) => (
          <li className={item.completed ? 'profile-completion-done' : ''} key={item.key}>
            <span />
            {content.items[item.key]}
          </li>
        ))}
      </ul>
    </aside>
  )
}
