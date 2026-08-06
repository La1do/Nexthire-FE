import { useEffect, useId, useRef } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import type { RecruiterDecisionStatus } from '../utils/recruiterApplicationDecisionValidation'

type ApplicationDecisionConfirmModalProps = {
  application: RecruiterApplicationItem
  feedback: string
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
  status: RecruiterDecisionStatus
  translations: RecruiterApplicationsTranslations['drawer']['decision']['confirmModal']
}

function OfferIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function RejectIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export function ApplicationDecisionConfirmModal({
  application,
  feedback,
  isSubmitting,
  onCancel,
  onConfirm,
  status,
  translations,
}: ApplicationDecisionConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const isSubmittingRef = useRef(isSubmitting)
  const titleId = useId()
  const descriptionId = useId()
  const isOffer = status === 'OFFERED'
  isSubmittingRef.current = isSubmitting
  const isOfferToReject = application.status === 'OFFERED' && status === 'REJECTED'

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmittingRef.current) {
        onCancel()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      previousActiveElementRef.current?.focus()
    }
  }, [onCancel])

  const title = isOffer
    ? translations.offerTitle
    : isOfferToReject
      ? translations.offerToRejectTitle
      : translations.rejectTitle

  const description = (isOffer
    ? translations.offerDescription
    : isOfferToReject
      ? translations.offerToRejectDescription
      : translations.rejectDescription
  )
    .replace('{{candidate}}', application.candidateName)
    .replace('{{job}}', application.jobTitle)

  return (
    <div
      className="recruiter-application-confirm-backdrop"
      onMouseDown={() => {
        if (!isSubmitting) onCancel()
      }}
      role="presentation"
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`recruiter-application-confirm-modal recruiter-application-confirm-modal--${isOffer ? 'offer' : 'reject'}`}
        onMouseDown={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
      >
        <button
          aria-label={translations.closeLabel}
          className="recruiter-application-confirm-modal__close"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="recruiter-application-confirm-modal__icon">
          {isOffer ? <OfferIcon /> : <RejectIcon />}
        </div>

        <div className="recruiter-application-confirm-modal__content">
          <p className="recruiter-application-confirm-modal__eyebrow">
            {isOffer ? translations.offerEyebrow : translations.rejectEyebrow}
          </p>
          <h3 id={titleId}>{title}</h3>
          <p id={descriptionId}>{description}</p>
        </div>

        {feedback ? (
          <div className="recruiter-application-confirm-modal__feedback">
            <span>{translations.feedbackLabel}</span>
            <p>{feedback}</p>
          </div>
        ) : (
          <p className="recruiter-application-confirm-modal__empty-feedback">{translations.noFeedback}</p>
        )}

        <div className="recruiter-application-confirm-modal__actions">
          <button disabled={isSubmitting} onClick={onCancel} type="button">
            {translations.cancelAction}
          </button>
          <button
            className="recruiter-application-confirm-modal__confirm"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
            type="button"
          >
            {isSubmitting ? translations.submitting : isOffer ? translations.offerAction : translations.rejectAction}
          </button>
        </div>
      </div>
    </div>
  )
}
