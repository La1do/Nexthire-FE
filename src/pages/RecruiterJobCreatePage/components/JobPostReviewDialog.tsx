import { useEffect } from 'react'
import { Button } from '../../_components'
import type { Locale } from '../../../i18n'
import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type { PublicCategory } from '../../../types/job.types'
import type { JobPostAction, JobPostChecklist, JobPostFormValues } from '../types'
import { getJobPostChecklist } from '../utils/jobPostValidation'

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

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return null
  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string, locale: Locale) {
  if (!value) return null
  return new Date(`${value}T00:00:00`).toLocaleDateString(locale)
}

function createSalaryLabel(
  values: JobPostFormValues,
  translations: RecruiterJobCreateTranslations['preview'],
  locale: Locale,
) {
  if (!values.isSalaryVisible) return translations.salaryHidden
  const salaryMin = parseOptionalNumber(values.salaryMin)
  const salaryMax = parseOptionalNumber(values.salaryMax)
  if (salaryMin === null && salaryMax === null) return translations.salaryNegotiable
  if (salaryMin !== null && salaryMax !== null) {
    return `${formatNumber(salaryMin, locale)} - ${formatNumber(salaryMax, locale)} ${values.salaryCurrency}`
  }
  const salaryValue = salaryMin ?? salaryMax
  return salaryValue === null ? translations.salaryNegotiable : `${formatNumber(salaryValue, locale)} ${values.salaryCurrency}`
}

function getChecklistProgress(checklist: JobPostChecklist) {
  const total = Object.keys(checklist).length
  const done = Object.values(checklist).filter(Boolean).length
  return { done, total, value: Math.round((done / total) * 100) }
}

type MetaRow = { label: string; value: string | null }

function MetaRow({ label, value }: MetaRow) {
  if (!value) return null
  return (
    <div className="review-meta__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
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
  const labels = translations.preview.labels
  const checklist = getJobPostChecklist(values)
  const progress = getChecklistProgress(checklist)
  const title = values.title.trim() || translations.preview.emptyTitle
  const selectedCategory = categories.find((category) => category.id === values.categoryId)
  const deadline = formatDate(values.deadline, locale)
  const openings = parseOptionalNumber(values.numberOfOpenings)

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

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
            ×
          </button>
        </div>

        <div className="job-post-review-dialog__body">
          <div className="review-grid">
            <section className="review-card review-meta">
              <h3>{title}</h3>
              <p className="review-meta__company">{companyName}</p>
              <dl>
                <MetaRow label={labels.location} value={values.location.trim() || null} />
                <MetaRow label={labels.category} value={selectedCategory?.name ?? noCategoryLabel} />
                <MetaRow
                  label={labels.salary}
                  value={createSalaryLabel(values, translations.preview, locale)}
                />
                <MetaRow label={labels.deadline} value={deadline ?? translations.preview.noDeadline} />
                {values.workingType ? (
                  <MetaRow label={labels.workingType} value={optionLabels.workingTypes[values.workingType]} />
                ) : null}
                {values.employmentType && values.experienceLevel ? (
                  <MetaRow
                    label={labels.employmentType}
                    value={`${optionLabels.employmentTypes[values.employmentType]} · ${optionLabels.experienceLevels[values.experienceLevel]}`}
                  />
                ) : null}
                {openings ? <MetaRow label={labels.openings} value={formatNumber(openings, locale)} /> : null}
              </dl>
              {values.skills.length ? (
                <div className="review-meta__skills">
                  <p>{labels.skills}</p>
                  <ul>
                    {values.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="review-meta__skills">
                  <p>{labels.skills}</p>
                  <span>{emptySkillsLabel}</span>
                </div>
              )}
            </section>

            <section className="review-card review-readiness">
              <div className="review-readiness__head">
                <span>{translations.preview.readinessLabel}</span>
                <strong>{progress.value}%</strong>
              </div>
              <div className="review-readiness__bar">
                <span style={{ width: `${progress.value}%` }} />
              </div>
              <p>
                {translations.preview.readinessProgress
                  .replace('{done}', String(progress.done))
                  .replace('{total}', String(progress.total))}
              </p>
              <ul className="review-readiness__list">
                <li className={checklist.basics ? 'is-done' : undefined}>{translations.preview.checklistItems.basics}</li>
                <li className={checklist.salary ? 'is-done' : undefined}>{translations.preview.checklistItems.salary}</li>
                <li className={checklist.skills ? 'is-done' : undefined}>{translations.preview.checklistItems.skills}</li>
                <li className={checklist.content ? 'is-done' : undefined}>{translations.preview.checklistItems.content}</li>
                <li className={checklist.deadline ? 'is-done' : undefined}>{translations.preview.checklistItems.deadline}</li>
              </ul>
            </section>
          </div>

          <section className="review-card review-content">
            {values.description.trim() ? (
              <div>
                <h4>{labels.description}</h4>
                <p>{values.description.trim()}</p>
              </div>
            ) : null}
            {values.requirements.trim() ? (
              <div>
                <h4>{labels.requirements}</h4>
                <p>{values.requirements.trim()}</p>
              </div>
            ) : null}
            <div>
              <h4>{labels.benefits}</h4>
              <p>{values.benefits.trim() || translations.preview.noBenefits}</p>
            </div>
          </section>
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
