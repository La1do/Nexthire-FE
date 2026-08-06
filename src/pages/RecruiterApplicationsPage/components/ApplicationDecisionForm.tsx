import { useEffect, useState } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import {
  APPLICATION_FEEDBACK_MAX_LENGTH,
  type RecruiterDecisionStatus,
  validateApplicationFeedback,
} from '../utils/recruiterApplicationDecisionValidation'
import { ApplicationDecisionConfirmModal } from './ApplicationDecisionConfirmModal'

type ApplicationDecisionFormProps = {
  application: RecruiterApplicationItem
  isSubmitting: boolean
  onSubmit: (status: RecruiterDecisionStatus, feedback: string) => Promise<boolean>
  translations: RecruiterApplicationsTranslations['drawer']['decision']
}

type PendingDecision = {
  feedback: string
  status: RecruiterDecisionStatus
}

type DecisionValidationError = ReturnType<typeof validateApplicationFeedback>

export function ApplicationDecisionForm({
  application,
  isSubmitting,
  onSubmit,
  translations,
}: ApplicationDecisionFormProps) {
  const [feedback, setFeedback] = useState(application.statusNote ?? '')
  const [error, setError] = useState<DecisionValidationError>(null)
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null)
  const isDecisionCompleted = ['OFFERED', 'REJECTED', 'WITHDRAWN', 'CANCELLED'].includes(application.status)
  const isOffer = application.status === 'OFFERED'
  const isRejected = application.status === 'REJECTED'

  useEffect(() => {
    setFeedback(application.statusNote ?? '')
    setError(null)
    setPendingDecision(null)
  }, [application.id, application.statusNote])

  function handleDecision(status: RecruiterDecisionStatus) {
    const validationError = validateApplicationFeedback(status, feedback)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setPendingDecision({ feedback: feedback.trim(), status })
  }

  async function confirmDecision() {
    if (!pendingDecision) return

    const succeeded = await onSubmit(pendingDecision.status, pendingDecision.feedback)
    if (succeeded) {
      setPendingDecision(null)
    }
  }

  return (
    <section className="recruiter-application-decision" aria-labelledby="recruiter-application-decision-title">
      <div className="recruiter-application-decision__heading">
        <div>
          <h3 id="recruiter-application-decision-title">{translations.title}</h3>
          <p>{isDecisionCompleted ? translations.readOnlyDescription : translations.description}</p>
        </div>
      </div>

      {isOffer || isRejected ? (
        <div
          className={`recruiter-application-decision__result recruiter-application-decision__result--${isOffer ? 'offered' : 'rejected'}`}
          role="status"
        >
          <span aria-hidden="true" className="recruiter-application-decision__result-icon">
            {isOffer ? '✓' : '×'}
          </span>
          <div>
            <strong>{isOffer ? translations.offeredResultTitle : translations.rejectedResultTitle}</strong>
            <p>{isOffer ? translations.offeredResultDescription : translations.rejectedResultDescription}</p>
          </div>
        </div>
      ) : null}

      {isDecisionCompleted ? (
        <div className="recruiter-application-decision__feedback-readonly">
          <span>{translations.feedbackLabel}</span>
          <p>{feedback || translations.noFeedback}</p>
        </div>
      ) : (
        <>
          <label className="recruiter-application-decision__field">
            <span>{translations.feedbackLabel}</span>
            <textarea
              disabled={isSubmitting}
              maxLength={APPLICATION_FEEDBACK_MAX_LENGTH}
              onChange={(event) => {
                setFeedback(event.target.value)
                if (error) setError(null)
              }}
              placeholder={translations.feedbackPlaceholder}
              rows={5}
              value={feedback}
            />
          </label>

          <div className="recruiter-application-decision__meta">
            <span className={error ? 'recruiter-application-decision__error' : undefined} role={error ? 'alert' : undefined}>
              {error ?? translations.feedbackHint}
            </span>
            <span>{translations.characterCount.replace('{{count}}', String(feedback.length)).replace('{{max}}', String(APPLICATION_FEEDBACK_MAX_LENGTH))}</span>
          </div>
        </>
      )}

      {!isDecisionCompleted ? (
        <div className="recruiter-application-decision__actions">
          <button
            className="recruiter-application-decision__offer"
            disabled={isSubmitting}
            onClick={() => handleDecision('OFFERED')}
            type="button"
          >
            {isSubmitting ? translations.submitting : translations.offerAction}
          </button>
          <button
            className="recruiter-application-decision__reject"
            disabled={isSubmitting}
            onClick={() => handleDecision('REJECTED')}
            type="button"
          >
            {isSubmitting ? translations.submitting : translations.rejectAction}
          </button>
        </div>
      ) : null}

      {application.decidedAt ? (
        <p className="recruiter-application-decision__decided-at">
          {translations.decidedAtLabel}: <strong>{application.decidedAt}</strong>
        </p>
      ) : null}

      {pendingDecision ? (
        <ApplicationDecisionConfirmModal
          application={application}
          feedback={pendingDecision.feedback}
          isSubmitting={isSubmitting}
          onCancel={() => setPendingDecision(null)}
          onConfirm={confirmDecision}
          status={pendingDecision.status}
          translations={translations.confirmModal}
        />
      ) : null}
    </section>
  )
}
