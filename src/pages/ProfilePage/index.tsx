import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { createCandidateProfile } from './utils/profileData'
import { getProfileCompletion } from './utils/profileCompletion'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024
const CV_PARSE_POLL_INTERVAL_MS = 2000
const CV_PARSE_MAX_POLLS = 45
const CV_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const EDITABLE_PROFILE_FIELDS = [
  'avatarDocumentId',
  'contactEmail',
  'education',
  'experiences',
  'headline',
  'linkedin',
  'location',
  'name',
  'phone',
  'portfolio',
  'skills',
  'summary',
] as const

function mergeParsedProfileWithLocalChanges(
  parsedProfile: CandidateProfile,
  parseBaseline: CandidateProfile | null,
  currentProfile: CandidateProfile,
) {
  if (!parseBaseline) {
    return { hasLocalChanges: false, profile: parsedProfile }
  }

  const mergedProfile = { ...parsedProfile }
  let hasLocalChanges = false

  EDITABLE_PROFILE_FIELDS.forEach((field) => {
    if (JSON.stringify(currentProfile[field]) === JSON.stringify(parseBaseline[field])) {
      return
    }

    hasLocalChanges = true
    Object.assign(mergedProfile, { [field]: currentProfile[field] })
  })

  return { hasLocalChanges, profile: mergedProfile }
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
  const [isStartingCvParse, setStartingCvParse] = useState(false)
  const [cvMessage, setCvMessage] = useState<string | undefined>(undefined)
  const [cvError, setCvError] = useState<string | undefined>(undefined)
  const cvParseBaselineRef = useRef<CandidateProfile | null>(null)
  const profileRef = useRef(profile)
  profileRef.current = profile
  const completion = useMemo(() => getProfileCompletion(profile), [profile])

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      const data = await candidateService.getMyProfile()
      setProfile(createProfileFromCandidateAggregate(data))
      setHasUnsavedChanges(false)
      cvParseBaselineRef.current = null
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!profile.defaultCvId || profile.defaultCvParseStatus !== 'PARSING') {
      return
    }

    cvParseBaselineRef.current ??= profileRef.current

    let active = true
    let pollCount = 0
    let timeoutId: number | undefined

    const pollProfile = async () => {
      pollCount += 1

      try {
        const data = await candidateService.getMyProfile()

        if (!active) {
          return
        }

        const nextProfile = createProfileFromCandidateAggregate(data)

        if (nextProfile.defaultCvParseStatus === 'PARSED') {
          const result = mergeParsedProfileWithLocalChanges(
            nextProfile,
            cvParseBaselineRef.current,
            profileRef.current,
          )
          setProfile(result.profile)
          setHasUnsavedChanges(result.hasLocalChanges)
          setCvError(undefined)
          setCvMessage(
            result.hasLocalChanges
              ? content.sections.resume.parseSuccessWithLocalChanges
              : content.sections.resume.parseSuccess,
          )
          cvParseBaselineRef.current = null
          return
        }

        if (nextProfile.defaultCvParseStatus === 'FAILED') {
          setProfile((currentProfile) => ({
            ...currentProfile,
            defaultCvParseStatus: 'FAILED',
          }))
          setCvMessage(undefined)
          setCvError(content.sections.resume.parseFailed)
          cvParseBaselineRef.current = null
          return
        }
      } catch {
        // Parsing continues on the server; transient polling errors are retried below.
      }

      if (pollCount >= CV_PARSE_MAX_POLLS) {
        setCvError(content.sections.resume.parseTimeout)
        cvParseBaselineRef.current = null
        return
      }

      timeoutId = window.setTimeout(pollProfile, CV_PARSE_POLL_INTERVAL_MS)
    }

    timeoutId = window.setTimeout(pollProfile, CV_PARSE_POLL_INTERVAL_MS)

    return () => {
      active = false
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [content.sections.resume, profile.defaultCvId, profile.defaultCvParseStatus])

  function updateProfile(patch: Partial<CandidateProfile>) {
    setProfile((currentProfile) => ({ ...currentProfile, ...patch }))
    setHasUnsavedChanges(true)
    setSaveError(undefined)
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

  async function saveProfile(): Promise<CandidateProfile | null> {
    setSaving(true)
    setSaveError(undefined)

    try {
      const data = await candidateService.updateMyProfile(createCandidateUpdatePayload(profile))
      const nextProfile = createProfileFromCandidateAggregate(data)
      profileRef.current = nextProfile
      setProfile(nextProfile)
      setHasUnsavedChanges(false)
      return nextProfile
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.states.saveError)
      return null
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
    const extension = file.name.split('.').pop()?.toLowerCase()
    const hasSupportedExtension = extension === 'pdf' || extension === 'doc' || extension === 'docx'

    if (!CV_MIME_TYPES.has(file.type) && !hasSupportedExtension) {
      setCvMessage(undefined)
      setCvError(content.sections.resume.invalidFileType)
      return
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      setCvMessage(undefined)
      setCvError(content.sections.resume.fileTooLarge)
      return
    }

    setUploadingResume(true)
    setSaveError(undefined)
    setCvError(undefined)
    setCvMessage(undefined)

    try {
      const cv = await candidateService.uploadCv(file, {
        isDefault: true,
        parse: false,
        title: file.name,
      })
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvId: cv.id,
        defaultCvParseStatus: cv.parseStatus,
        resumeFile: cv.title ?? file.name,
      }))
      cvParseBaselineRef.current = null
      setCvMessage(content.sections.resume.uploadSuccess)
    } catch (error) {
      setCvError(getApiErrorEnvelope(error)?.error.message ?? content.states.cvUploadError)
    } finally {
      setUploadingResume(false)
    }
  }

  async function parseResume() {
    if (!profile.defaultCvId || profile.defaultCvParseStatus === 'PARSING') {
      return
    }

    setStartingCvParse(true)
    setSaveError(undefined)
    setCvError(undefined)
    setCvMessage(undefined)

    try {
      let parseBaseline = profile

      if (hasUnsavedChanges) {
        const savedProfile = await saveProfile()

        if (!savedProfile) {
          setCvError(content.sections.resume.saveBeforeParseError)
          return
        }

        parseBaseline = savedProfile
      }

      profileRef.current = parseBaseline
      cvParseBaselineRef.current = parseBaseline
      const cv = await candidateService.parseCv(profile.defaultCvId)
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvParseStatus: cv.parseStatus,
      }))

      if (cv.parseStatus === 'FAILED') {
        cvParseBaselineRef.current = null
        setCvError(content.sections.resume.parseFailed)
      } else if (cv.parseStatus === 'PARSED') {
        const data = await candidateService.getMyProfile()
        const result = mergeParsedProfileWithLocalChanges(
          createProfileFromCandidateAggregate(data),
          cvParseBaselineRef.current,
          profileRef.current,
        )
        setProfile(result.profile)
        setHasUnsavedChanges(result.hasLocalChanges)
        setCvMessage(
          result.hasLocalChanges
            ? content.sections.resume.parseSuccessWithLocalChanges
            : content.sections.resume.parseSuccess,
        )
        cvParseBaselineRef.current = null
      } else {
        setCvMessage(content.sections.resume.parseStarted)
      }
    } catch (error) {
      cvParseBaselineRef.current = null
      setCvError(getApiErrorEnvelope(error)?.error.message ?? content.sections.resume.parseFailed)
    } finally {
      setStartingCvParse(false)
    }
  }

  async function removeResume() {
    if (!profile.defaultCvId) {
      updateProfile({ resumeFile: '' })
      return
    }

    setUploadingResume(true)
    setSaveError(undefined)
    setCvError(undefined)
    setCvMessage(undefined)

    try {
      await candidateService.deleteCv(profile.defaultCvId)
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvId: null,
        defaultCvParseStatus: null,
        resumeFile: '',
      }))
      cvParseBaselineRef.current = null
    } catch (error) {
      setCvError(getApiErrorEnvelope(error)?.error.message ?? content.states.cvDeleteError)
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
            cvError={cvError}
            cvMessage={cvMessage}
            content={content.sections.resume}
            emptyResumeLabel={content.states.emptyResume}
            isStartingCvParse={isStartingCvParse}
            isUploadingResume={isUploadingResume}
            onChange={(field, value) => updateProfile({ [field]: value })}
            onParseResume={() => void parseResume()}
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
