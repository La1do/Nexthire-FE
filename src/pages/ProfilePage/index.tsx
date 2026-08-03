import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from '../../i18n'
import { useAuth, useGlobalLoader, useToast } from '../../context'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { candidateService } from '../../services/candidate.service'
import { Button } from '../_components'
import { BasicInfoForm } from './components/BasicInfoForm'
import { CompletionPanel } from './components/CompletionPanel'
import { ContactInfoForm } from './components/ContactInfoForm'
import { CvParseReviewDialog } from './components/CvParseReviewDialog'
import { EducationEditor } from './components/EducationEditor'
import { ExperienceEditor } from './components/ExperienceEditor'
import { ProfileCvAssistCard } from './components/ProfileCvAssistCard'
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
import {
  isProfileSparse,
  mergeCvParsedProfileBySelection,
  mergeParsedProfileWithLocalChanges,
  mergeProfileWithLocalChanges,
  shouldReviewParsedProfile,
  type CvParseReviewGroupId,
} from './utils/cvParseReview'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024
const CV_PARSE_POLL_INTERVAL_MS = 2000
const CV_PARSE_MAX_POLLS = 45
const AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const CV_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function isSupportedAvatarFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const hasSupportedExtension = extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'webp'

  return AVATAR_MIME_TYPES.has(file.type) || hasSupportedExtension
}

export function ProfilePage() {
  const { common, pages } = useTranslations()
  const { refreshUser } = useAuth()
  const { track: trackGlobalLoader } = useGlobalLoader()
  const toast = useToast()
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
  const [isCvAssistDismissed, setCvAssistDismissed] = useState(false)
  const [isApplyingCvParseReview, setApplyingCvParseReview] = useState(false)
  const [cvMessage, setCvMessage] = useState<string | undefined>(undefined)
  const [cvError, setCvError] = useState<string | undefined>(undefined)
  const [cvParseReview, setCvParseReview] = useState<{
    baselineProfile: CandidateProfile
    parsedProfile: CandidateProfile
  } | null>(null)
  const cvParseBaselineRef = useRef<CandidateProfile | null>(null)
  const profileRef = useRef(profile)
  profileRef.current = profile
  const completion = useMemo(() => getProfileCompletion(profile), [profile])
  const isSparseProfile = useMemo(() => isProfileSparse(profile), [profile])
  const shouldShowCvAssist =
    !isCvAssistDismissed &&
    (isSparseProfile || !profile.defaultCvId || profile.defaultCvParseStatus !== 'PARSED')

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      const data = await candidateService.getMyProfile()
      setProfile(createProfileFromCandidateAggregate(data))
      setHasUnsavedChanges(false)
      cvParseBaselineRef.current = null
      setCvParseReview(null)
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleParsedProfileReady = useCallback(
    (parsedProfile: CandidateProfile) => {
      const baselineProfile = mergeProfileWithLocalChanges(
        cvParseBaselineRef.current,
        profileRef.current,
      )

      if (shouldReviewParsedProfile(baselineProfile, parsedProfile)) {
        const currentWithParsedCv = mergeCvParsedProfileBySelection(
          baselineProfile,
          parsedProfile,
          [],
        )
        profileRef.current = currentWithParsedCv
        setProfile(currentWithParsedCv)
        setHasUnsavedChanges(false)
        setCvParseReview({ baselineProfile, parsedProfile })
        setCvError(undefined)
        setCvMessage(content.sections.resume.parseReviewReady)
        toast.info(content.sections.resume.parseReviewReady)
        cvParseBaselineRef.current = null

        void (async () => {
          setSaving(true)

          try {
            const data = await trackGlobalLoader(
              candidateService.updateMyProfile(
                createCandidateUpdatePayload(currentWithParsedCv),
              ),
              {
                label: common.loader.applyingCvParseLabel,
                mode: 'bar',
              },
            )
            const restoredProfile = createProfileFromCandidateAggregate(data)
            profileRef.current = restoredProfile
            setProfile(restoredProfile)
            setHasUnsavedChanges(false)
            refreshUser()
          } catch (error) {
            const message = getApiErrorEnvelope(error)?.error.message ?? content.states.saveError
            setSaveError(message)
            toast.error(message)
          } finally {
            setSaving(false)
          }
        })()

        return
      }

      const result = mergeParsedProfileWithLocalChanges(
        parsedProfile,
        cvParseBaselineRef.current,
        profileRef.current,
      )
      profileRef.current = result.profile
      setProfile(result.profile)
      setHasUnsavedChanges(result.hasLocalChanges)
      setCvError(undefined)
      const message = result.hasLocalChanges
        ? content.sections.resume.parseSuccessWithLocalChanges
        : content.sections.resume.parseSuccess
      setCvMessage(message)
      toast.success(message)
      cvParseBaselineRef.current = null
    },
    [common.loader.applyingCvParseLabel, content.sections.resume, content.states.saveError, refreshUser, toast, trackGlobalLoader],
  )

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
          handleParsedProfileReady(nextProfile)
          return
        }

        if (nextProfile.defaultCvParseStatus === 'FAILED') {
          setProfile((currentProfile) => ({
            ...currentProfile,
            defaultCvParseStatus: 'FAILED',
          }))
          setCvMessage(undefined)
          setCvError(content.sections.resume.parseFailed)
          toast.error(content.sections.resume.parseFailed)
          cvParseBaselineRef.current = null
          return
        }
      } catch {
        // Parsing continues on the server; transient polling errors are retried below.
      }

      if (pollCount >= CV_PARSE_MAX_POLLS) {
        setCvError(content.sections.resume.parseTimeout)
        toast.warning(content.sections.resume.parseTimeout)
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
  }, [content.sections.resume, handleParsedProfileReady, profile.defaultCvId, profile.defaultCvParseStatus, toast])

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

  async function saveProfile(
    profileToSave: CandidateProfile = profile,
    options: { loaderLabel?: string; showToast?: boolean; successMessage?: string } = {},
  ): Promise<CandidateProfile | null> {
    setSaving(true)
    setSaveError(undefined)

    try {
      const data = await trackGlobalLoader(
        candidateService.updateMyProfile(createCandidateUpdatePayload(profileToSave)),
        {
          label: options.loaderLabel ?? common.loader.savingProfileLabel,
          mode: 'bar',
        },
      )
      const nextProfile = createProfileFromCandidateAggregate(data)
      profileRef.current = nextProfile
      setProfile(nextProfile)
      setHasUnsavedChanges(false)
      refreshUser()
      if (options.showToast !== false) {
        toast.success(options.successMessage ?? content.states.saveSuccess)
      }
      return nextProfile
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? content.states.saveError
      setSaveError(message)
      toast.error(message)
      return null
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(file: File) {
    if (!isSupportedAvatarFile(file)) {
      setSaveError(content.states.avatarInvalidFileType)
      toast.error(content.states.avatarInvalidFileType)
      return
    }

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      setSaveError(content.states.avatarFileTooLarge)
      toast.error(content.states.avatarFileTooLarge)
      return
    }

    setUploadingAvatar(true)
    setSaveError(undefined)

    try {
      const data = await trackGlobalLoader(candidateService.uploadAvatar(file), {
        label: common.loader.uploadingAvatarLabel,
        mode: 'overlay',
      })
      setProfile((currentProfile) => ({
        ...currentProfile,
        avatarDocumentId: data.profile.avatarDocumentId,
        avatarUrl: data.profile.avatarUrl,
      }))
      refreshUser()
      toast.success(content.states.avatarUploadSuccess)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? content.states.avatarUploadError
      setSaveError(message)
      toast.error(message)
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
      toast.error(content.sections.resume.invalidFileType)
      return
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      setCvMessage(undefined)
      setCvError(content.sections.resume.fileTooLarge)
      toast.error(content.sections.resume.fileTooLarge)
      return
    }

    setUploadingResume(true)
    setSaveError(undefined)
    setCvError(undefined)
    setCvMessage(undefined)
    setCvParseReview(null)
    setCvAssistDismissed(false)

    try {
      const cv = await trackGlobalLoader(
        candidateService.uploadCv(file, {
          isDefault: true,
          parse: false,
          title: file.name,
        }),
        {
          label: common.loader.uploadingCvLabel,
          mode: 'overlay',
        },
      )
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvId: cv.id,
        defaultCvParseStatus: cv.parseStatus,
        resumeFile: cv.title ?? file.name,
      }))
      cvParseBaselineRef.current = null
      setCvMessage(content.sections.resume.uploadSuccess)
      toast.success(content.sections.resume.uploadSuccess)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? content.states.cvUploadError
      setCvError(message)
      toast.error(message)
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
    setCvParseReview(null)
    setCvAssistDismissed(false)

    try {
      let parseBaseline = profile

      if (hasUnsavedChanges) {
        const savedProfile = await saveProfile(profile, { showToast: false })

        if (!savedProfile) {
          setCvError(content.sections.resume.saveBeforeParseError)
          toast.error(content.sections.resume.saveBeforeParseError)
          return
        }

        parseBaseline = savedProfile
      }

      profileRef.current = parseBaseline
      cvParseBaselineRef.current = parseBaseline
      const cv = await trackGlobalLoader(candidateService.parseCv(profile.defaultCvId), {
        label: common.loader.parsingCvLabel,
        mode: 'overlay',
      })
      setProfile((currentProfile) => ({
        ...currentProfile,
        defaultCvParseStatus: cv.parseStatus,
      }))

      if (cv.parseStatus === 'FAILED') {
        cvParseBaselineRef.current = null
        setCvError(content.sections.resume.parseFailed)
        toast.error(content.sections.resume.parseFailed)
      } else if (cv.parseStatus === 'PARSED') {
        const data = await candidateService.getMyProfile()
        handleParsedProfileReady(createProfileFromCandidateAggregate(data))
      } else {
        setCvMessage(content.sections.resume.parseStarted)
        toast.info(content.sections.resume.parseStarted)
      }
    } catch (error) {
      cvParseBaselineRef.current = null
      const message = getApiErrorEnvelope(error)?.error.message ?? content.sections.resume.parseFailed
      setCvError(message)
      toast.error(message)
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
    setCvParseReview(null)
    setCvAssistDismissed(false)

    try {
      await trackGlobalLoader(candidateService.deleteCv(profile.defaultCvId), {
        label: common.loader.deletingCvLabel,
        mode: 'bar',
      })
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

  async function applyCvParseReview(selectedGroups: CvParseReviewGroupId[]) {
    if (!cvParseReview || isApplyingCvParseReview) {
      return
    }

    setApplyingCvParseReview(true)
    setCvError(undefined)

    try {
      const finalProfile = mergeCvParsedProfileBySelection(
        cvParseReview.baselineProfile,
        cvParseReview.parsedProfile,
        selectedGroups,
      )
      const savedProfile = await saveProfile(finalProfile, {
        loaderLabel: common.loader.applyingCvParseLabel,
        successMessage:
          selectedGroups.length > 0
            ? content.cvParseReview.applySuccess
            : content.cvParseReview.keepSuccess,
      })

      if (!savedProfile) {
        return
      }

      setCvParseReview(null)
      setCvAssistDismissed(true)
      setCvMessage(
        selectedGroups.length > 0
          ? content.sections.resume.parseReviewApplied
          : content.sections.resume.parseReviewKept,
      )
    } finally {
      setApplyingCvParseReview(false)
    }
  }

  function keepCurrentCvParseReview() {
    void applyCvParseReview([])
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
        onAvatarUpload={(file) => void uploadAvatar(file)}
        profile={profile}
      />

      {shouldShowCvAssist ? (
        <ProfileCvAssistCard
          content={content.cvAssist}
          isProfileSparse={isSparseProfile}
          isStartingCvParse={isStartingCvParse}
          isUploadingResume={isUploadingResume}
          onDismiss={() => setCvAssistDismissed(true)}
          onParseResume={() => void parseResume()}
          onUploadResume={(file) => void uploadResume(file)}
          profile={profile}
        />
      ) : null}

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

      {cvParseReview ? (
        <CvParseReviewDialog
          baselineProfile={cvParseReview.baselineProfile}
          content={content.cvParseReview}
          isApplying={isApplyingCvParseReview || isSaving}
          onApply={(selectedGroups) => void applyCvParseReview(selectedGroups)}
          onKeepCurrent={keepCurrentCvParseReview}
          parsedProfile={cvParseReview.parsedProfile}
        />
      ) : null}
    </div>
  )
}

export default ProfilePage
