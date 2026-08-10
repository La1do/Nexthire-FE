import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../../context'
import { useAuthGuard } from '../../../hooks/useAuthGuard'
import type { JobDetailTranslations } from '../../../i18n/types'
import { getApiErrorCode, getApiErrorEnvelope } from '../../../lib/api/apiError'
import { applicationService } from '../../../services/application.service'
import { candidateService } from '../../../services/candidate.service'
import type { ApplicationResponse, ApplicationStatus } from '../../../types/application.types'
import type { CandidateCvResponse, CandidateMeResponse } from '../../../types/candidate.types'
import type { JobDetailView } from '../types'

type ApplyJobButtonProps = {
  content: JobDetailTranslations['sidebar']
  job: JobDetailView
}

type ProfileLoadState = 'idle' | 'loading' | 'ready' | 'error'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
type UploadState = 'idle' | 'uploading' | 'success' | 'error'
type ApplicationLookupState = 'idle' | 'loading' | 'ready' | 'error'

const COVER_LETTER_MAX = 5000
const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024
const CV_ACCEPT_TYPES =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const CV_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const INACTIVE_APPLICATION_STATUSES = new Set<ApplicationStatus>(['CANCELLED'])

function getPreferredCv(profile: CandidateMeResponse | null) {
  if (!profile) return null
  return profile.defaultCv ?? profile.cvs.find((cv) => cv.isDefault) ?? profile.cvs[0] ?? null
}

function getCvTitle(cv: CandidateCvResponse | null, fallback: string) {
  return cv?.title?.trim() || fallback
}

function isSupportedCvFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const hasSupportedExtension = extension === 'pdf' || extension === 'doc' || extension === 'docx'

  return CV_MIME_TYPES.has(file.type) || hasSupportedExtension
}

function isActiveApplicationForJob(application: ApplicationResponse, jobId: string) {
  return application.jobId === jobId && !INACTIVE_APPLICATION_STATUSES.has(application.status)
}

function getApplyErrorMessage(error: unknown, content: JobDetailTranslations['sidebar']['applyModal']) {
  const code = getApiErrorCode(error)

  if (code === 'APPLICATION.JOB_NOT_APPLICABLE') return content.jobNotApplicableError
  if (code === 'APPLICATION.CV_NOT_FOUND') return content.cvNotFoundError

  return getApiErrorEnvelope(error)?.error.message ?? content.submitError
}

export function ApplyJobButton({ content, job }: ApplyJobButtonProps) {
  const { isAuthenticated, isCandidate, loginHref } = useAuthGuard()
  const toast = useToast()
  const modal = content.applyModal
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const firstFieldRef = useRef<HTMLSelectElement | HTMLInputElement | null>(null)
  const [isOpen, setOpen] = useState(false)
  const [profileState, setProfileState] = useState<ProfileLoadState>('idle')
  const [candidateProfile, setCandidateProfile] = useState<CandidateMeResponse | null>(null)
  const [selectedCvId, setSelectedCvId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState('')
  const [uploadedCvId, setUploadedCvId] = useState<string | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState('')
  const [submittedApplication, setSubmittedApplication] = useState<ApplicationResponse | null>(null)
  const [existingApplication, setExistingApplication] = useState<ApplicationResponse | null>(null)
  const [applicationLookupState, setApplicationLookupState] = useState<ApplicationLookupState>('idle')
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  const cvs = useMemo(() => {
    if (!candidateProfile) return []
    if (!candidateProfile.defaultCv || candidateProfile.cvs.some((cv) => cv.id === candidateProfile.defaultCv?.id)) {
      return candidateProfile.cvs
    }

    return [candidateProfile.defaultCv, ...candidateProfile.cvs]
  }, [candidateProfile])
  const selectedCv = useMemo(() => {
    const preferredCv = getPreferredCv(candidateProfile)
    return cvs.find((cv) => cv.id === selectedCvId) ?? preferredCv
  }, [candidateProfile, cvs, selectedCvId])
  const hasCv = cvs.length > 0
  const hasApplied = alreadyApplied || Boolean(existingApplication) || Boolean(submittedApplication)
  const isCheckingApplication = applicationLookupState === 'loading'
  const isSubmitting = submitState === 'submitting'
  const isUploadingCv = uploadState === 'uploading'
  const isBusy = isSubmitting || isUploadingCv
  const coverLetterTooLong = coverLetter.length > COVER_LETTER_MAX
  const coverLetterCount = modal.coverLetterCounter.replace('{{count}}', String(coverLetter.length))
  const showUploadSuccess = uploadState === 'success' && selectedCv?.id === uploadedCvId
  let uploadVisualState: UploadState = uploadState
  if (uploadError) uploadVisualState = 'error'
  else if (uploadState === 'success' && !showUploadSuccess) uploadVisualState = 'idle'
  let uploadFeedbackClassName: string | undefined
  if (uploadError) uploadFeedbackClassName = 'is-error'
  else if (showUploadSuccess) uploadFeedbackClassName = 'is-success'
  const uploadFeedbackMessage = uploadError || (showUploadSuccess ? modal.cvUploadSuccess : '')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      return
    }

    if (dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !isCandidate) return undefined

    let ignore = false
    setProfileState('loading')
    setSubmitError('')
    setUploadError('')
    setUploadState('idle')
    setUploadedCvId(null)

    candidateService
      .getMyProfile()
      .then((profile) => {
        if (ignore) return

        const preferredCv = getPreferredCv(profile)
        setCandidateProfile(profile)
        setSelectedCvId(preferredCv?.id ?? '')
        setProfileState('ready')
      })
      .catch((error) => {
        if (ignore) return
        setCandidateProfile(null)
        setSelectedCvId('')
        setProfileState('error')
        const message = getApiErrorEnvelope(error)?.error.message ?? modal.profileLoadError
        setSubmitError(message)
        toast.error(message)
      })

    return () => {
      ignore = true
    }
  }, [isOpen, isCandidate, modal.profileLoadError, toast])

  useEffect(() => {
    if (!isAuthenticated || !isCandidate) {
      setExistingApplication(null)
      setApplicationLookupState('idle')
      return undefined
    }

    let ignore = false

    async function loadExistingApplication() {
      setApplicationLookupState('loading')
      setExistingApplication(null)
      setSubmittedApplication(null)
      setAlreadyApplied(false)

      try {
        let page = 1
        let totalPages = 1
        let matchedApplication: ApplicationResponse | null = null

        do {
          const response = await applicationService.getMyApplications({ limit: 100, page })
          matchedApplication = response.data.find((application) => isActiveApplicationForJob(application, job.id)) ?? null
          totalPages = response.meta.totalPages || 1
          page += 1
        } while (!matchedApplication && page <= totalPages)

        if (ignore) return

        setExistingApplication(matchedApplication)
        setApplicationLookupState('ready')
      } catch {
        if (ignore) return

        setExistingApplication(null)
        setApplicationLookupState('error')
      }
    }

    void loadExistingApplication()

    return () => {
      ignore = true
    }
  }, [isAuthenticated, isCandidate, job.id])

  useEffect(() => {
    if (!isOpen || profileState === 'loading') return undefined

    const frame = window.requestAnimationFrame(() => {
      firstFieldRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, profileState, hasCv])

  function openDialog() {
    setOpen(true)
    setSubmitState(hasApplied ? 'success' : 'idle')
    setSubmitError('')
    setUploadError('')
    setUploadState('idle')
    setUploadedCvId(null)
    if (!hasApplied) setProfileState('loading')
  }

  function closeDialog() {
    if (isBusy) return
    setOpen(false)
  }

  async function handleCvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file || !candidateProfile || isBusy) return

    setUploadError('')
    setSubmitError('')
    setUploadedCvId(null)
    if (submitState === 'error') setSubmitState('idle')

    if (!isSupportedCvFile(file)) {
      setUploadState('error')
      setUploadError(modal.cvInvalidType)
      toast.error(modal.cvInvalidType)
      return
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      setUploadState('error')
      setUploadError(modal.cvTooLarge)
      toast.error(modal.cvTooLarge)
      return
    }

    setUploadState('uploading')

    try {
      const cv = await candidateService.uploadCv(file, {
        isDefault: false,
        parse: false,
        title: file.name,
      })

      setCandidateProfile((currentProfile) => {
        if (!currentProfile) return currentProfile

        const nextCv = { ...cv, isDefault: false }
        const nextCvs = [nextCv, ...currentProfile.cvs.filter((item) => item.id !== cv.id)]

        return {
          ...currentProfile,
          cvs: nextCvs,
          defaultCv: currentProfile.defaultCv,
        }
      })
      setSelectedCvId(cv.id)
      setUploadedCvId(cv.id)
      setUploadState('success')
      toast.success(modal.cvUploadSuccess)
    } catch (error) {
      setUploadState('error')
      const message = getApiErrorEnvelope(error)?.error.message ?? modal.cvUploadError
      setUploadError(message)
      toast.error(message)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedCvId) {
      setSubmitState('error')
      setSubmitError(modal.noCvDescription)
      toast.error(modal.noCvDescription)
      return
    }

    if (coverLetterTooLong) {
      setSubmitState('error')
      setSubmitError(modal.coverLetterTooLong)
      toast.error(modal.coverLetterTooLong)
      return
    }

    setSubmitState('submitting')
    setSubmitError('')

    try {
      const application = await applicationService.apply({
        jobId: job.id,
        candidateCvId: selectedCvId,
        coverLetter: coverLetter.trim() || null,
        parse: false,
      })

      setSubmittedApplication(application)
      setExistingApplication(application)
      setAlreadyApplied(false)
      setSubmitState('success')
      toast.success(modal.submitSuccessTitle)
    } catch (error) {
      if (getApiErrorCode(error) === 'APPLICATION.DUPLICATE_ACTIVE_APPLICATION') {
        setAlreadyApplied(true)
        setSubmitState('success')
        toast.info(content.appliedHint)
        return
      }

      setSubmitState('error')
      const message = getApplyErrorMessage(error, modal)
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="job-detail-apply-block">
        <Link className="job-detail-apply-cta" to={loginHref}>
          {content.apply}
        </Link>
        <p className="job-detail-apply-hint">{content.applyLoginHint}</p>
      </div>
    )
  }

  if (!isCandidate) {
    return (
      <div className="job-detail-apply-block">
        <button className="job-detail-apply-cta job-detail-apply-cta-disabled" disabled type="button">
          {content.apply}
        </button>
        <p className="job-detail-apply-hint">{content.candidateOnly}</p>
      </div>
    )
  }

  if (hasApplied && !isOpen) {
    return (
      <div className="job-detail-apply-block">
        <Link className="job-detail-apply-cta job-detail-apply-cta-success" to="/profile/applications">
          {content.applied}
        </Link>
        <p className="job-detail-apply-hint">{content.appliedHint}</p>
      </div>
    )
  }

  if (isCheckingApplication && !isOpen) {
    return (
      <div className="job-detail-apply-block">
        <button className="job-detail-apply-cta job-detail-apply-cta-disabled" disabled type="button">
          <span aria-hidden="true" className="job-apply-spinner" />
          {content.apply}
        </button>
        <p className="job-detail-apply-hint">{content.applyStatusLoading}</p>
      </div>
    )
  }

  return (
    <div className="job-detail-apply-block">
      <button className="job-detail-apply-cta" type="button" onClick={openDialog}>
        {content.apply}
      </button>
      <p className="job-detail-apply-hint">{content.applyHint}</p>

      <dialog
        ref={dialogRef}
        className={`job-apply-dialog${submitState === 'success' ? ' is-success' : ''}`}
        aria-labelledby="job-apply-dialog-title"
        onCancel={(event) => {
          if (isBusy) {
            event.preventDefault()
            return
          }

          setOpen(false)
        }}
        onClose={() => setOpen(false)}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeDialog()
        }}
      >
        <div className="job-apply-modal">
          <header className="job-apply-modal__header">
            <div>
              <span>{modal.kicker}</span>
              <h2 id="job-apply-dialog-title">{modal.title.replace('{{job}}', job.title)}</h2>
              <p>{modal.description}</p>
            </div>
            <button
              className="job-apply-modal__close"
              disabled={isBusy}
              type="button"
              aria-label={modal.close}
              onClick={closeDialog}
            >
              ×
            </button>
          </header>

          {submitState === 'success' ? (
            <div className="job-apply-modal__success" aria-live="polite">
              <span aria-hidden="true">✓</span>
              <h3>{alreadyApplied ? modal.duplicateTitle : modal.submitSuccessTitle}</h3>
              <p>{alreadyApplied ? modal.duplicateDescription : modal.submitSuccessDescription}</p>
              <div className="job-apply-modal__actions">
                <Link className="job-apply-modal__primary" to="/profile/applications">
                  {modal.viewApplications}
                </Link>
                <button className="job-apply-modal__secondary" type="button" onClick={closeDialog}>
                  {modal.close}
                </button>
              </div>
            </div>
          ) : (
            <form className="job-apply-modal__form" onSubmit={(event) => void handleSubmit(event)}>
              <div className="job-apply-modal__body">
                {profileState === 'loading' || profileState === 'idle' ? (
                  <div className="job-apply-modal__loading" aria-live="polite">
                    <span aria-hidden="true" className="job-apply-spinner" />
                    <p>{modal.cvLoading}</p>
                  </div>
                ) : null}

                {profileState === 'error' ? (
                  <div className="job-apply-modal__notice is-error" role="alert">
                    <strong>{modal.profileLoadError}</strong>
                    <p>{submitError}</p>
                  </div>
                ) : null}

                {profileState === 'ready' ? (
                  <>
                    {!hasCv ? (
                      <div className="job-apply-modal__notice">
                        <strong>{modal.noCvTitle}</strong>
                        <p>{modal.noCvDescription}</p>
                      </div>
                    ) : (
                      <>
                        <label className="job-apply-field" htmlFor="job-apply-cv">
                          <span>{modal.cvLabel}</span>
                          <small>{modal.cvHelper}</small>
                          <select
                            ref={(node) => {
                              firstFieldRef.current = node
                            }}
                            id="job-apply-cv"
                            value={selectedCvId}
                            onChange={(event) => {
                              setSelectedCvId(event.target.value)
                              setSubmitError('')
                              setUploadError('')
                              setUploadState('idle')
                              setUploadedCvId(null)
                              if (submitState === 'error') setSubmitState('idle')
                            }}
                          >
                            {cvs.map((cv) => (
                              <option key={cv.id} value={cv.id}>
                                {getCvTitle(cv, modal.cvFallback)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="job-apply-cv-summary">
                          <strong>{getCvTitle(selectedCv, modal.cvFallback)}</strong>
                          {selectedCv ? (
                            <span>{selectedCv.isDefault ? modal.defaultCvBadge : modal.selectedCvBadge}</span>
                          ) : null}
                        </div>
                      </>
                    )}

                    <section
                      className={`job-apply-upload is-${uploadVisualState}`}
                      aria-labelledby="job-apply-upload-title"
                      aria-live="polite"
                    >
                      <div className="job-apply-upload__copy">
                        <strong id="job-apply-upload-title">
                          {hasCv ? modal.uploadAlternativeTitle : modal.uploadFirstTitle}
                        </strong>
                        <p>{hasCv ? modal.uploadAlternativeDescription : modal.uploadFirstDescription}</p>
                      </div>
                      <div className="job-apply-upload__actions">
                        <label
                          className={`job-apply-file-action${isBusy ? ' is-disabled' : ''}`}
                          aria-disabled={isBusy}
                        >
                          {isUploadingCv ? (
                            <span aria-hidden="true" className="job-apply-spinner" />
                          ) : (
                            <span aria-hidden="true" className="job-apply-file-action__mark">
                              CV
                            </span>
                          )}
                          <span>{isUploadingCv ? modal.cvUploading : modal.uploadCvAction}</span>
                          <input
                            ref={(node) => {
                              if (!hasCv) firstFieldRef.current = node
                            }}
                            aria-describedby="job-apply-upload-feedback"
                            aria-invalid={uploadError ? true : undefined}
                            accept={CV_ACCEPT_TYPES}
                            disabled={isBusy}
                            type="file"
                            onChange={(event) => void handleCvUpload(event)}
                          />
                        </label>
                        <small id="job-apply-upload-feedback" className={uploadFeedbackClassName}>
                          {uploadFeedbackMessage}
                        </small>
                      </div>
                    </section>

                    <label
                      className={`job-apply-field${coverLetterTooLong ? ' is-error' : ''}`}
                      htmlFor="job-apply-cover-letter"
                    >
                      <span>{modal.coverLetterLabel}</span>
                      <textarea
                        aria-describedby="job-apply-cover-letter-helper"
                        aria-invalid={coverLetterTooLong ? true : undefined}
                        id="job-apply-cover-letter"
                        maxLength={COVER_LETTER_MAX + 1}
                        placeholder={modal.coverLetterPlaceholder}
                        rows={5}
                        value={coverLetter}
                        onChange={(event) => {
                          setCoverLetter(event.target.value)
                          setSubmitError('')
                          if (submitState === 'error') setSubmitState('idle')
                        }}
                      />
                      <small id="job-apply-cover-letter-helper">
                        {coverLetterTooLong ? modal.coverLetterTooLong : `${modal.coverLetterHint} · ${coverLetterCount}`}
                      </small>
                    </label>
                  </>
                ) : null}

                {submitError && profileState !== 'error' ? (
                  <p className="job-apply-modal__submit-error" role="alert">
                    {submitError}
                  </p>
                ) : null}
              </div>

              <div className="job-apply-modal__actions">
                <button
                  className="job-apply-modal__primary"
                  disabled={profileState !== 'ready' || !selectedCvId || isBusy || coverLetterTooLong}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <span aria-hidden="true" className="job-apply-spinner" />
                      {modal.submitting}
                    </>
                  ) : (
                    modal.submit
                  )}
                </button>
                <button className="job-apply-modal__secondary" disabled={isBusy} type="button" onClick={closeDialog}>
                  {modal.close}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  )
}
