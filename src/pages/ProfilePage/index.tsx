import { useMemo, useState } from 'react'
import { useTranslations } from '../../i18n'
import { BasicInfoForm } from './components/BasicInfoForm'
import { CompletionPanel } from './components/CompletionPanel'
import { ContactInfoForm } from './components/ContactInfoForm'
import { EducationEditor } from './components/EducationEditor'
import { ExperienceEditor } from './components/ExperienceEditor'
import { ProfileHero } from './components/ProfileHero'
import { ResumeLinksForm } from './components/ResumeLinksForm'
import { SkillsEditor } from './components/SkillsEditor'
import { StickyProfileActions } from './components/StickyProfileActions'
import type { CandidateEducation, CandidateExperience, CandidateProfile } from './types'
import { createCandidateProfile } from './utils/profileData'
import { getProfileCompletion } from './utils/profileCompletion'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export function ProfilePage() {
  const { pages } = useTranslations()
  const content = pages.profile
  const [profile, setProfile] = useState(() => createCandidateProfile(content.profile))
  const [newSkill, setNewSkill] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const completion = useMemo(() => getProfileCompletion(profile), [profile])

  function updateProfile(patch: Partial<CandidateProfile>) {
    setProfile((currentProfile) => ({ ...currentProfile, ...patch }))
    setHasUnsavedChanges(true)
  }

  function addSkill() {
    const skill = newSkill.trim()

    if (!skill || profile.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      return
    }

    updateProfile({ skills: [...profile.skills, skill] })
    setNewSkill('')
  }

  function removeSkill(skill: string) {
    updateProfile({ skills: profile.skills.filter((item) => item !== skill) })
  }

  function updateExperience(id: string, patch: Partial<CandidateExperience>) {
    updateProfile({
      experiences: profile.experiences.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  function addExperience() {
    updateProfile({
      experiences: [
        ...profile.experiences,
        {
          company: '',
          description: '',
          endDate: '',
          id: createId('exp'),
          isCurrent: false,
          position: '',
          startDate: '',
        },
      ],
    })
  }

  function removeExperience(id: string) {
    updateProfile({ experiences: profile.experiences.filter((item) => item.id !== id) })
  }

  function updateEducation(id: string, patch: Partial<CandidateEducation>) {
    updateProfile({
      education: profile.education.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  function addEducation() {
    updateProfile({
      education: [
        ...profile.education,
        {
          degree: '',
          endYear: '',
          id: createId('edu'),
          school: '',
          startYear: '',
        },
      ],
    })
  }

  function removeEducation(id: string) {
    updateProfile({ education: profile.education.filter((item) => item.id !== id) })
  }

  function saveProfile() {
    setHasUnsavedChanges(false)
  }

  return (
    <div className="profile-page">
      <ProfileHero completion={completion} content={content.hero} hasUnsavedChanges={hasUnsavedChanges} onSave={saveProfile} profile={profile} />

      <div className="profile-layout">
        <div className="profile-form-stack">
          <BasicInfoForm
            content={content.sections.basic}
            onChange={(field, value) => updateProfile({ [field]: value })}
            profile={profile}
          />
          <ContactInfoForm content={content.sections.contact} onChange={(field, value) => updateProfile({ [field]: value })} profile={profile} />
          <SkillsEditor
            content={content.sections.skills}
            newSkill={newSkill}
            onAddSkill={addSkill}
            onNewSkillChange={setNewSkill}
            onRemoveSkill={removeSkill}
            skills={profile.skills}
          />
          <ExperienceEditor
            content={content.sections.experience}
            experiences={profile.experiences}
            onAdd={addExperience}
            onRemove={removeExperience}
            onUpdate={updateExperience}
          />
          <EducationEditor
            content={content.sections.education}
            education={profile.education}
            onAdd={addEducation}
            onRemove={removeEducation}
            onUpdate={updateEducation}
          />
          <ResumeLinksForm
            content={content.sections.resume}
            onChange={(field, value) => updateProfile({ [field]: value })}
            onRemoveResume={() => updateProfile({ resumeFile: '' })}
            profile={profile}
          />
        </div>

        <CompletionPanel completion={completion} content={content.completion} />
      </div>

      <StickyProfileActions content={content.hero} hasUnsavedChanges={hasUnsavedChanges} onSave={saveProfile} />
    </div>
  )
}

export default ProfilePage
