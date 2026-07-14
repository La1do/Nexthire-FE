import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateEducation } from '../types'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type EducationEditorProps = {
  content: ProfileTranslations['sections']['education']
  education: CandidateEducation[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<CandidateEducation>) => void
}

export function EducationEditor({ content, education, onAdd, onRemove, onUpdate }: EducationEditorProps) {
  return (
    <ProfileSection description={content.description} title={content.title}>
      <div className="profile-repeat-list">
        {education.map((item) => (
          <article className="profile-repeat-card" key={item.id}>
            <button className="profile-repeat-remove" onClick={() => onRemove(item.id)} type="button">
              {content.remove}
            </button>

            <div className="profile-form-grid">
              <ProfileField label={content.degreeLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(item.id, { degree: event.target.value })} value={item.degree} />
              </ProfileField>
              <ProfileField label={content.schoolLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(item.id, { school: event.target.value })} value={item.school} />
              </ProfileField>
              <ProfileField label={content.startLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(item.id, { startYear: event.target.value })} value={item.startYear} />
              </ProfileField>
              <ProfileField label={content.endLabel}>
                <input className="profile-control" onChange={(event) => onUpdate(item.id, { endYear: event.target.value })} value={item.endYear} />
              </ProfileField>
            </div>
          </article>
        ))}
      </div>

      <button className="profile-add-button" onClick={onAdd} type="button">{content.add}</button>
    </ProfileSection>
  )
}
