import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { candidateService } from '../../services/candidate.service'
import { Button } from '../_components'
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
import {
  createCandidateUpdatePayload,
  createProfileFromCandidateAggregate,
} from './utils/candidateProfileApi'
import { hasParsedCvDraft, parseCvTextToProfileDraft } from './utils/cvDraftParser'
import type { ParsedCvDraft } from './utils/cvDraftParser'
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
  const [isLoading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [saveError, setSaveError] = useState<string | undefined>(undefined)
  const [isSaving, setSaving] = useState(false)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)
  const [isUploadingResume, setUploadingResume] = useState(false)
  const [cvDraftText, setCvDraftText] = useState('')
  const [cvDraftMessage, setCvDraftMessage] = useState<string | undefined>(undefined)
  const [cvDraftError, setCvDraftError] = useState<string | undefined>(undefined)
  const completion = useMemo(() => getProfileCompletion(profile), [profile])

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      const data = await candidateService.getMyProfile()
      setProfile(createProfileFromCandidateAggregate(data))
      setHasUnsavedChanges(false)
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  function updateProfile(patch: Partial<CandidateProfile>) {
    setProfile((currentProfile) => ({ ...currentProfile, ...patch }))
    setHasUnsavedChanges(true)
    setSaveError(undefined)
  }

  function mergeParsedCvDraft(currentProfile: CandidateProfile, draft: ParsedCvDraft): CandidateProfile {
    return {
      ...currentProfile,
      email: currentProfile.email || draft.profile.email || currentProfile.email,
      headline: draft.profile.headline ?? currentProfile.headline,
      linkedin: draft.profile.linkedin ?? currentProfile.linkedin,
      location: draft.profile.location ?? currentProfile.location,
      name: draft.profile.name ?? currentProfile.name,
      phone: draft.profile.phone ?? currentProfile.phone,
      portfolio: draft.profile.portfolio ?? currentProfile.portfolio,
      summary: draft.profile.summary ?? currentProfile.summary,
      education: draft.education.length ? draft.education : currentProfile.education,
      experiences: draft.experiences.length ? draft.experiences : currentProfile.experiences,
      skills: draft.skills.length
        ? [
            ...currentProfile.skills,
            ...draft.skills.filter(
              (skill) => !currentProfile.skills.some((currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase()),
            ),
          ]
        : currentProfile.skills,
    }
  }

  function parseCvDraftFromText(text: string) {
    const draft = parseCvTextToProfileDraft(text)

    if (!hasParsedCvDraft(draft)) {
      setCvDraftMessage(undefined)
      setCvDraftError(content.sections.resume.draftEmptyError)
      return
    }

    setProfile((currentProfile) => mergeParsedCvDraft(currentProfile, draft))
    setHasUnsavedChanges(true)
    setSaveError(undefined)
    setCvDraftError(undefined)
    setCvDraftMessage(content.sections.resume.draftApplied)
  }

  function updateCvDraftText(value: string) {
    setCvDraftText(value)
    setCvDraftError(undefined)
    setCvDraftMessage(undefined)
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

  async function saveProfile() {
    setSaving(true)
    setSaveError(undefined)

    try {
      const data = await candidateService.updateMyProfile(createCandidateUpdatePayload(profile))
      setProfile(createProfileFromCandidateAggregate(data))
      setHasUnsavedChanges(false)
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.states.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    setSaveError(undefined)

    try {
      const data = await candidateService.uploadAvatar(file)
      setProfile((currentProfile) => ({
        ...currentProfile,
        avatarDocumentId: data.profile.avatarDocumentId,
      }))
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.states.avatarUploadError)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function uploadResume(file: File) {
    setUploadingResume(true)
    setSaveError(undefined)

    try {
      const cv = await candidateService.uploadCv(file, {
        isDefault: true,
        title: file.name,
      })
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvId: cv.id,
        resumeFile: cv.title,
      }))
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.states.cvUploadError)
    } finally {
      setUploadingResume(false)
    }
  }

  async function removeResume() {
    if (!profile.defaultCvId) {
      updateProfile({ resumeFile: '' })
      return
    }

    setUploadingResume(true)
    setSaveError(undefined)

    try {
      await candidateService.deleteCv(profile.defaultCvId)
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvId: null,
        resumeFile: '',
      }))
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.states.cvDeleteError)
    } finally {
      setUploadingResume(false)
    }
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <section className="profile-state-card profile-card-motion">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="profile-page">
        <section className="profile-state-card profile-card-motion">
          <h2>{content.states.errorTitle}</h2>
          <p>{loadError}</p>
          <Button onClick={() => void loadProfile()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <ProfileHero
        completion={completion}
        content={content.hero}
        hasUnsavedChanges={hasUnsavedChanges}
        isUploadingAvatar={isUploadingAvatar}
        isSaving={isSaving}
        onAvatarUpload={(file) => void uploadAvatar(file)}
        onSave={() => void saveProfile()}
        profile={profile}
      />

      {saveError ? <p className="profile-api-message profile-api-message-error">{saveError}</p> : null}

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
            cvDraftError={cvDraftError}
            cvDraftMessage={cvDraftMessage}
            cvDraftText={cvDraftText}
            content={content.sections.resume}
            emptyResumeLabel={content.states.emptyResume}
            isUploadingResume={isUploadingResume}
            onChange={(field, value) => updateProfile({ [field]: value })}
            onCvDraftTextChange={updateCvDraftText}
            onParseCvDraft={() => parseCvDraftFromText(cvDraftText)}
            onRemoveResume={() => void removeResume()}
            onUploadResume={(file) => void uploadResume(file)}
            profile={profile}
          />
        </div>

        <CompletionPanel completion={completion} content={content.completion} />
      </div>

      <StickyProfileActions
        content={content.hero}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={() => void saveProfile()}
      />
    </div>
  )
}

export default ProfilePage
