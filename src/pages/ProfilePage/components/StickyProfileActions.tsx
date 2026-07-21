import type { ProfileTranslations } from '../../../i18n/types'

type StickyProfileActionsProps = {
  content: ProfileTranslations['hero']
  hasUnsavedChanges: boolean
  isSaving: boolean
  onSave: () => void
}

export function StickyProfileActions({ content, hasUnsavedChanges, isSaving, onSave }: StickyProfileActionsProps) {
  return (
    <div className="profile-sticky-actions">
      <span>{hasUnsavedChanges ? content.unsaved : content.saved}</span>
      <button disabled={isSaving} onClick={onSave} type="button">{content.save}</button>
    </div>
  )
}
