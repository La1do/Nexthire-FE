import type { KeyboardEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type SkillsEditorProps = {
  content: ProfileTranslations['sections']['skills']
  newSkill: string
  onAddSkill: () => void
  onNewSkillChange: (value: string) => void
  onRemoveSkill: (skill: string) => void
  skills: string[]
}

export function SkillsEditor({ content, newSkill, onAddSkill, onNewSkillChange, onRemoveSkill, skills }: SkillsEditorProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onAddSkill()
    }
  }

  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-skill-list">
        {skills.map((skill) => (
          <span className="profile-skill-chip" key={skill}>
            {skill}
            <button aria-label={content.removeLabel.replace('{{skill}}', skill)} onClick={() => onRemoveSkill(skill)} type="button">
              x
            </button>
          </span>
        ))}
      </div>

      <div className="profile-skill-entry">
        <ProfileField label={content.inputLabel}>
          <input
            className="profile-control"
            onChange={(event) => onNewSkillChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={content.inputPlaceholder}
            value={newSkill}
          />
        </ProfileField>
        <button onClick={onAddSkill} type="button">{content.add}</button>
      </div>
    </ProfileSection>
  )
}
