import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type { JobPostChecklist, JobPostFieldErrors, JobPostFormValues } from '../types'
import { isFutureDisplayDate } from './jobPostInput'

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN
}

export function getJobPostChecklist(values: JobPostFormValues): JobPostChecklist {
  const salaryMin = parseOptionalNumber(values.salaryMin)
  const salaryMax = parseOptionalNumber(values.salaryMax)
  const hasInvalidMin = salaryMin !== null && (Number.isNaN(salaryMin) || salaryMin < 0)
  const hasInvalidMax = salaryMax !== null && (Number.isNaN(salaryMax) || salaryMax < 0)
  const hasInvalidRange = salaryMin !== null && salaryMax !== null && salaryMax < salaryMin
  const hasDeadline = values.deadline.trim().length > 0

  return {
    basics:
      values.title.trim().length > 0 &&
      values.location.trim().length > 0 &&
      Boolean(values.employmentType && values.workingType && values.experienceLevel),
    salary: !values.isSalaryVisible || (!hasInvalidMin && !hasInvalidMax && !hasInvalidRange),
    skills: values.skills.length > 0,
    content: values.description.trim().length > 0 && values.requirements.trim().length > 0,
    deadline: !hasDeadline || isFutureDisplayDate(values.deadline),
  }
}

export function validateJobPostForm(
  values: JobPostFormValues,
  validation: RecruiterJobCreateTranslations['validation'],
  mode: 'draft' | 'submit' = 'submit',
) {
  const errors: JobPostFieldErrors = {}
  const salaryMin = parseOptionalNumber(values.salaryMin)
  const salaryMax = parseOptionalNumber(values.salaryMax)
  const openings = parseOptionalNumber(values.numberOfOpenings)

  if (!values.title.trim()) {
    errors.title = validation.titleRequired
  }

  if (mode === 'submit') {
    if (!values.employmentType) {
      errors.employmentType = validation.employmentTypeRequired
    }
  }

  if (mode === 'submit') {
    if (!values.workingType) {
      errors.workingType = validation.workingTypeRequired
    }
  }

  if (mode === 'submit') {
    if (!values.experienceLevel) {
      errors.experienceLevel = validation.experienceLevelRequired
    }
  }

  if (mode === 'submit') {
    if (!values.location.trim()) {
      errors.location = validation.locationRequired
    }
  }

  if (mode === 'submit') {
    if (!values.skills.length) {
      errors.skills = validation.skillsRequired
    }
  }

  if (mode === 'submit') {
    if (!values.description.trim()) {
      errors.description = validation.descriptionRequired
    }
  }

  if (mode === 'submit') {
    if (!values.requirements.trim()) {
      errors.requirements = validation.requirementsRequired
    }
  }

  if (values.isSalaryVisible && salaryMin !== null && (Number.isNaN(salaryMin) || salaryMin < 0)) {
    errors.salaryMin = validation.salaryMinInvalid
  }

  if (values.isSalaryVisible && salaryMax !== null && (Number.isNaN(salaryMax) || salaryMax < 0)) {
    errors.salaryMax = validation.salaryMaxInvalid
  }

  if (
    values.isSalaryVisible &&
    salaryMin !== null &&
    salaryMax !== null &&
    !Number.isNaN(salaryMin) &&
    !Number.isNaN(salaryMax) &&
    salaryMax < salaryMin
  ) {
    errors.salaryMax = validation.salaryRangeInvalid
  }

  if (
    values.numberOfOpenings.trim() &&
    (openings === null || Number.isNaN(openings) || !Number.isInteger(openings) || openings < 1 || openings > 1000)
  ) {
    errors.numberOfOpenings = validation.openingsInvalid
  }

  if (!isFutureDisplayDate(values.deadline)) {
    errors.deadline = validation.deadlineInvalid
  }

  return errors
}
