import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateExperience } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type ExperienceEditorProps = {
  content: ProfileTranslations['sections']['experience']
  experiences: CandidateExperience[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<CandidateExperience>) => void
}

export function ExperienceEditor({ content, experiences, onAdd, onRemove, onUpdate }: ExperienceEditorProps) {
  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-repeat-list">
        {experiences.map((experience) => (
          <article className="profile-repeat-card" key={experience.id}>
            <button className="profile-repeat-remove" onClick={() => onRemove(experience.id)} type="button">
              {content.remove}
            </button>

            <div className="profile-form-grid">
              <ProfileField label={content.positionLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(experience.id, { position: event.target.value })} value={experience.position} />
              </ProfileField>
              <ProfileField label={content.companyLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(experience.id, { company: event.target.value })} value={experience.company} />
              </ProfileField>
              <ProfileField label={content.startLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(experience.id, { startDate: event.target.value })} value={experience.startDate} />
              </ProfileField>
              <ProfileField label={content.endLabel}>
                <input
                  className="profile-control"
                  disabled={experience.isCurrent}
                  onChange={(event) => onUpdate(experience.id, { endDate: event.target.value })}
                  value={experience.endDate}
                />
              </ProfileField>
            </div>

            <label className="profile-checkbox-row">
              <input
                checked={experience.isCurrent}
                onChange={(event) => onUpdate(experience.id, { endDate: event.target.checked ? '' : experience.endDate, isCurrent: event.target.checked })}
                type="checkbox"
              />
              <span>{content.currentLabel}</span>
            </label>

            <ProfileField label={content.descriptionLabel}>
              <textarea
                className="profile-control profile-textarea"
                onChange={(event) => onUpdate(experience.id, { description: event.target.value })}
                value={experience.description}
              />
            </ProfileField>
          </article>
        ))}
      </div>

      <button className="profile-add-button" onClick={onAdd} type="button">{content.add}</button>
    </ProfileSection>
  )
}
