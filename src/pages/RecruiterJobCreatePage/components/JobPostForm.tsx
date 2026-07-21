import { useId } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type {
  JobExperienceLevel,
  JobType,
  JobWorkingType,
  PublicCategory,
} from '../../../types/job.types'
import { Button, Input } from '../../_components'
import type {
  JobPostAction,
  JobPostFieldErrors,
  JobPostFormValues,
} from '../types'

type JobPostFormProps = {
  categories: ReadonlyArray<PublicCategory>
  categoryWarning?: string
  errors: JobPostFieldErrors
  hasUnsavedChanges: boolean
  onAddSkill: () => void
  onChange: <TField extends keyof JobPostFormValues>(
    field: TField,
    value: JobPostFormValues[TField],
  ) => void
  onRemoveSkill: (skill: string) => void
  onRequestReview: () => void
  onReset: () => void
  onSubmit: (action: JobPostAction) => void
  submitError?: string
  submittingAction?: JobPostAction
  translations: RecruiterJobCreateTranslations
  values: JobPostFormValues
}

type SelectOption = {
  label: string
  value: string
}

type SelectInputProps = {
  error?: string
  label: string
  onChange: (value: string) => void
  options: ReadonlyArray<SelectOption>
  value: string
}

type TextareaInputProps = {
  error?: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}

const employmentTypeValues: ReadonlyArray<JobType> = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'FREELANCE',
]
const workingTypeValues: ReadonlyArray<JobWorkingType> = ['ONSITE', 'REMOTE', 'HYBRID']
const experienceLevelValues: ReadonlyArray<JobExperienceLevel> = [
  'INTERN',
  'FRESHER',
  'JUNIOR',
  'MIDDLE',
  'SENIOR',
  'LEAD',
]
const currencyValues = ['VND', 'USD', 'JPY'] as const

function SelectInput({ error, label, onChange, options, value }: SelectInputProps) {
  const generatedId = useId()
  const errorId = `${generatedId}-error`

  return (
    <label className="job-post-field" htmlFor={generatedId}>
      <span>{label}</span>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="form-control job-post-select"
        id={generatedId}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <small className="job-post-field-error" id={errorId}>
          {error}
        </small>
      ) : null}
    </label>
  )
}

function TextareaInput({
  error,
  label,
  onChange,
  placeholder,
  value,
}: TextareaInputProps) {
  const generatedId = useId()
  const errorId = `${generatedId}-error`

  return (
    <label className="job-post-textarea" htmlFor={generatedId}>
      <span>{label}</span>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={generatedId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {error ? (
        <small className="job-post-field-error" id={errorId}>
          {error}
        </small>
      ) : null}
    </label>
  )
}

export function JobPostForm({
  categories,
  categoryWarning,
  errors,
  hasUnsavedChanges,
  onAddSkill,
  onChange,
  onRemoveSkill,
  onRequestReview,
  onReset,
  onSubmit,
  submitError,
  submittingAction,
  translations,
  values,
}: JobPostFormProps) {
  const { fields, options } = translations.form
  const isSubmitting = Boolean(submittingAction)
  const isSavingDraft = submittingAction === 'draft'
  const isSaveDraftDisabled = isSubmitting || !hasUnsavedChanges
  const categoryOptions = [
    { label: options.noCategory, value: '' },
    ...categories.map((category) => ({
      label: category.name,
      value: category.id,
    })),
  ]
  const employmentTypeOptions = employmentTypeValues.map((value) => ({
    label: options.employmentTypes[value],
    value,
  }))
  const workingTypeOptions = workingTypeValues.map((value) => ({
    label: options.workingTypes[value],
    value,
  }))
  const experienceLevelOptions = experienceLevelValues.map((value) => ({
    label: options.experienceLevels[value],
    value,
  }))
  const currencyOptions = currencyValues.map((value) => ({
    label: options.currencies[value],
    value,
  }))
  const employmentTypeSelectOptions = [
    { label: fields.employmentType.label, value: '' },
    ...employmentTypeOptions,
  ]
  const workingTypeSelectOptions = [
    { label: fields.workingType.label, value: '' },
    ...workingTypeOptions,
  ]
  const experienceLevelSelectOptions = [
    { label: fields.experienceLevel.label, value: '' },
    ...experienceLevelOptions,
  ]

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      onAddSkill()
    }
  }

  function handleNumberChange(field: 'salaryMin' | 'salaryMax' | 'numberOfOpenings') {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <form
      className="job-post-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit('draft')
      }}
    >
      <section className="job-post-form-section recruiter-panel">
        <div className="recruiter-panel__header">
          <div>
            <h2>{translations.form.sections.basics.title}</h2>
            <p>{translations.form.sections.basics.description}</p>
          </div>
        </div>

        <div className="job-post-form-grid">
          <Input
            error={errors.title}
            label={fields.title.label}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder={fields.title.placeholder}
            value={values.title}
          />
          <SelectInput
            label={fields.category.label}
            onChange={(value) => onChange('categoryId', value)}
            options={categoryOptions}
            value={values.categoryId}
          />
          <SelectInput
            error={errors.employmentType}
            label={fields.employmentType.label}
            onChange={(value) => onChange('employmentType', value as JobPostFormValues['employmentType'])}
            options={employmentTypeSelectOptions}
            value={values.employmentType}
          />
          <SelectInput
            error={errors.workingType}
            label={fields.workingType.label}
            onChange={(value) => onChange('workingType', value as JobPostFormValues['workingType'])}
            options={workingTypeSelectOptions}
            value={values.workingType}
          />
          <SelectInput
            error={errors.experienceLevel}
            label={fields.experienceLevel.label}
            onChange={(value) => onChange('experienceLevel', value as JobPostFormValues['experienceLevel'])}
            options={experienceLevelSelectOptions}
            value={values.experienceLevel}
          />
          <Input
            error={errors.location}
            label={fields.location.label}
            onChange={(event) => onChange('location', event.target.value)}
            placeholder={fields.location.placeholder}
            value={values.location}
          />
        </div>
        {categoryWarning ? <p className="job-post-inline-warning">{categoryWarning}</p> : null}
      </section>

      <section className="job-post-form-section recruiter-panel">
        <div className="recruiter-panel__header">
          <div>
            <h2>{translations.form.sections.details.title}</h2>
            <p>{translations.form.sections.details.description}</p>
          </div>
        </div>

        <label className="job-post-toggle">
          <input
            checked={values.isSalaryVisible}
            onChange={(event) => onChange('isSalaryVisible', event.target.checked)}
            type="checkbox"
          />
          <span>{fields.isSalaryVisible.label}</span>
        </label>

        <div className="job-post-form-grid job-post-form-grid--salary">
          <Input
            disabled={!values.isSalaryVisible}
            error={errors.salaryMin}
            inputMode="numeric"
            label={fields.salaryMin.label}
            onChange={handleNumberChange('salaryMin')}
            placeholder={fields.salaryMin.placeholder}
            value={values.salaryMin}
          />
          <Input
            disabled={!values.isSalaryVisible}
            error={errors.salaryMax}
            inputMode="numeric"
            label={fields.salaryMax.label}
            onChange={handleNumberChange('salaryMax')}
            placeholder={fields.salaryMax.placeholder}
            value={values.salaryMax}
          />
          <SelectInput
            label={fields.salaryCurrency.label}
            onChange={(value) => onChange('salaryCurrency', value as JobPostFormValues['salaryCurrency'])}
            options={currencyOptions}
            value={values.salaryCurrency}
          />
        </div>

        <div className="job-post-form-grid">
          <Input
            error={errors.deadline}
            label={fields.deadline.label}
            onChange={(event) => onChange('deadline', event.target.value)}
            type="date"
            value={values.deadline}
          />
          <Input
            error={errors.numberOfOpenings}
            inputMode="numeric"
            label={fields.numberOfOpenings.label}
            onChange={handleNumberChange('numberOfOpenings')}
            placeholder={fields.numberOfOpenings.placeholder}
            value={values.numberOfOpenings}
          />
        </div>

        <div className="job-post-skills-field">
          <label htmlFor="job-post-skill-input">{fields.skills.label}</label>
          <div className="job-post-skill-entry">
            <input
              className="form-control"
              id="job-post-skill-input"
              onChange={(event) => onChange('skillInput', event.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder={fields.skills.placeholder}
              value={values.skillInput}
            />
            <Button disabled={!values.skillInput.trim()} onClick={onAddSkill} variant="secondary">
              {fields.skills.add}
            </Button>
          </div>
          {values.skills.length ? (
            <ul className="job-post-skill-list">
              {values.skills.map((skill) => (
                <li key={skill}>
                  <span>{skill}</span>
                  <button
                    aria-label={`${fields.skills.removeLabel} ${skill}`}
                    onClick={() => onRemoveSkill(skill)}
                    type="button"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="job-post-skill-empty">{fields.skills.empty}</p>
          )}
          {errors.skills ? <small className="job-post-field-error">{errors.skills}</small> : null}
        </div>
      </section>

      <section className="job-post-form-section recruiter-panel">
        <div className="recruiter-panel__header">
          <div>
            <h2>{translations.form.sections.content.title}</h2>
            <p>{translations.form.sections.content.description}</p>
          </div>
        </div>

        <TextareaInput
          error={errors.description}
          label={fields.description.label}
          onChange={(value) => onChange('description', value)}
          placeholder={fields.description.placeholder}
          value={values.description}
        />
        <TextareaInput
          error={errors.requirements}
          label={fields.requirements.label}
          onChange={(value) => onChange('requirements', value)}
          placeholder={fields.requirements.placeholder}
          value={values.requirements}
        />
        <TextareaInput
          label={fields.benefits.label}
          onChange={(value) => onChange('benefits', value)}
          placeholder={fields.benefits.placeholder}
          value={values.benefits}
        />
      </section>

      <div className="job-post-form-actions recruiter-panel">
        {submitError ? <p>{submitError}</p> : null}
        <div>
          <Button disabled={isSubmitting} onClick={onReset} type="button" variant="ghost">
            {translations.form.actions.reset}
          </Button>
          <Button
            className={`job-post-save-draft-button${hasUnsavedChanges ? ' is-dirty' : ''}${isSavingDraft ? ' is-saving' : ''}`}
            disabled={isSaveDraftDisabled}
            onClick={() => onSubmit('draft')}
            type="button"
            variant="secondary"
          >
            {isSavingDraft ? (
              <>
                <span aria-hidden="true" className="job-post-action-spinner" />
                {translations.form.actions.savingDraft}
              </>
            ) : hasUnsavedChanges ? (
              translations.form.actions.saveDraft
            ) : (
              translations.form.actions.noDraftChanges
            )}
          </Button>
          <Button disabled={isSubmitting} onClick={onRequestReview} type="button">
            {submittingAction === 'submit'
              ? translations.form.actions.submittingReview
              : translations.form.actions.submitReview}
          </Button>
        </div>
      </div>
    </form>
  )
}
