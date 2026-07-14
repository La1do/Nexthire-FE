import type { ProfileTranslations } from '../../../i18n/types'

type StickyProfileActionsProps = {
  content: ProfileTranslations['hero']
  hasUnsavedChanges: boolean
  onSave: () => void
}

export function StickyProfileActions({ content, hasUnsavedChanges, onSave }: StickyProfileActionsProps) {
  return (
    <div className="profile-sticky-actions">
      <span>{hasUnsavedChanges ? content.unsaved : content.saved}</span>
      <button onClick={onSave} type="button">{content.save}</button>
    </div>
  )
}
