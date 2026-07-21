import { useEffect } from 'react'
import { Button } from '../../_components'
import type { Locale } from '../../../i18n'
import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type { PublicCategory } from '../../../types/job.types'
import type { JobPostAction, JobPostFormValues } from '../types'
import { JobPostPreview } from './JobPostPreview'

type JobPostReviewDialogProps = {
  categories: ReadonlyArray<PublicCategory>
  companyName: string
  emptySkillsLabel: string
  isOpen: boolean
  locale: Locale
  noCategoryLabel: string
  onClose: () => void
  onSaveDraft: () => void
  onSubmitReview: () => void
  optionLabels: RecruiterJobCreateTranslations['form']['options']
  submittingAction?: JobPostAction
  translations: RecruiterJobCreateTranslations
  values: JobPostFormValues
}

export function JobPostReviewDialog({
  categories,
  companyName,
  emptySkillsLabel,
  isOpen,
  locale,
  noCategoryLabel,
  onClose,
  onSaveDraft,
  onSubmitReview,
  optionLabels,
  submittingAction,
  translations,
  values,
}: JobPostReviewDialogProps) {
  const isSubmitting = Boolean(submittingAction)
  const isSavingDraft = submittingAction === 'draft'
  const isSubmittingReview = submittingAction === 'submit'

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="job-post-review-dialog-backdrop" role="presentation">
      <section
        aria-labelledby="job-post-review-dialog-title"
        aria-modal="true"
        className="job-post-review-dialog"
        role="dialog"
      >
        <div className="job-post-review-dialog__header">
          <div>
            <p className="recruiter-eyebrow">{translations.hero.eyebrow}</p>
            <h2 id="job-post-review-dialog-title">{translations.form.reviewDialog.title}</h2>
            <p>{translations.form.reviewDialog.description}</p>
          </div>
          <button
            aria-label={translations.form.reviewDialog.cancel}
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="job-post-review-dialog__body">
          <JobPostPreview
            categories={categories}
            companyName={companyName}
            emptySkillsLabel={emptySkillsLabel}
            locale={locale}
            noCategoryLabel={noCategoryLabel}
            optionLabels={optionLabels}
            translations={translations.preview}
            values={values}
          />
        </div>

        <div className="job-post-review-dialog__actions">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="ghost">
            {translations.form.reviewDialog.cancel}
          </Button>
          <Button disabled={isSubmitting} onClick={onSaveDraft} type="button" variant="secondary">
            {isSavingDraft ? (
              <>
                <span aria-hidden="true" className="job-post-action-spinner" />
                {translations.form.reviewDialog.savingDraft}
              </>
            ) : (
              translations.form.reviewDialog.saveDraft
            )}
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmitReview} type="button">
            {isSubmittingReview ? (
              <>
                <span aria-hidden="true" className="job-post-action-spinner" />
                {translations.form.reviewDialog.submittingReview}
              </>
            ) : (
              translations.form.reviewDialog.submitReview
            )}
          </Button>
        </div>
      </section>
    </div>
  )
}
