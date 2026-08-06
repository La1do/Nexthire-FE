import type {
  CreateRecruiterJobPayload,
  JobExperienceLevel,
  JobType,
  JobWorkingType,
  UpdateRecruiterJobPayload,
} from '../../../types/job.types'
import type { JobPostFormValues } from '../types'
import { createDeadlineIsoFromDisplayDate } from './jobPostInput'

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function assignOptionalString<T extends object, TKey extends keyof T>(
  target: T,
  key: TKey,
  value: string,
) {
  const normalizedValue = value.trim()

  if (normalizedValue) {
    Object.assign(target, { [key]: normalizedValue })
  }
}

export function createJobPostPayload(values: JobPostFormValues): CreateRecruiterJobPayload {
  const payload: CreateRecruiterJobPayload = {
    title: values.title.trim(),
  }

  assignOptionalString(payload, 'description', values.description)
  assignOptionalString(payload, 'requirements', values.requirements)
  assignOptionalString(payload, 'location', values.location)

  const skills = values.skills.map((skill) => skill.trim()).filter(Boolean)
  const benefits = values.benefits.trim()
  const categoryId = values.categoryId.trim()
  const salaryMin = values.isSalaryVisible ? parseOptionalNumber(values.salaryMin) : null
  const salaryMax = values.isSalaryVisible ? parseOptionalNumber(values.salaryMax) : null
  const deadline = createDeadlineIsoFromDisplayDate(values.deadline)
  const numberOfOpenings = parseOptionalNumber(values.numberOfOpenings)

  if (skills.length) {
    payload.skills = skills
  }

  if (benefits) {
    payload.benefits = benefits
  }

  if (categoryId) {
    payload.categoryId = categoryId
  }

  if (values.employmentType) {
    payload.employmentType = values.employmentType as JobType
  }

  if (values.workingType) {
    payload.workingType = values.workingType as JobWorkingType
  }

  if (values.experienceLevel) {
    payload.experienceLevel = values.experienceLevel as JobExperienceLevel
  }

  if (values.isSalaryVisible) {
    if (salaryMin !== null) {
      payload.salaryMin = salaryMin
    }

    if (salaryMax !== null) {
      payload.salaryMax = salaryMax
    }
  } else {
    payload.salaryMin = null
    payload.salaryMax = null
  }

  payload.salaryCurrency = values.salaryCurrency
  payload.isSalaryVisible = values.isSalaryVisible

  if (deadline) {
    payload.deadline = deadline
  }

  if (numberOfOpenings !== null) {
    payload.numberOfOpenings = numberOfOpenings
  }

  return payload
}

export function createJobPostUpdatePayload(
  current: CreateRecruiterJobPayload,
  saved: CreateRecruiterJobPayload,
): UpdateRecruiterJobPayload {
  const update: UpdateRecruiterJobPayload = {}
  const keys = new Set<keyof CreateRecruiterJobPayload>([
    ...Object.keys(current) as Array<keyof CreateRecruiterJobPayload>,
    ...Object.keys(saved) as Array<keyof CreateRecruiterJobPayload>,
  ])

  for (const key of keys) {
    const currentValue = current[key]
    const savedValue = saved[key]
    const changed = Array.isArray(currentValue) || Array.isArray(savedValue)
      ? JSON.stringify(currentValue ?? []) !== JSON.stringify(savedValue ?? [])
      : currentValue !== savedValue

    if (!changed) {
      continue
    }

    if (currentValue === undefined) {
      if (
        key === 'description' ||
        key === 'requirements' ||
        key === 'benefits' ||
        key === 'categoryId' ||
        key === 'employmentType' ||
        key === 'workingType' ||
        key === 'experienceLevel' ||
        key === 'location' ||
        key === 'salaryMin' ||
        key === 'salaryMax' ||
        key === 'deadline' ||
        key === 'numberOfOpenings'
      ) {
        Object.assign(update, { [key]: null })
      } else if (key === 'skills') {
        Object.assign(update, { skills: [] })
      }

      continue
    }

    Object.assign(update, { [key]: currentValue })
  }

  return update
}

export function createPublishedJobUpdatePayload(
  current: CreateRecruiterJobPayload,
  saved: CreateRecruiterJobPayload,
): UpdateRecruiterJobPayload {
  const update = createJobPostUpdatePayload(current, saved)
  const allowedKeys: ReadonlyArray<keyof UpdateRecruiterJobPayload> = [
    'deadline',
    'numberOfOpenings',
    'isSalaryVisible',
  ]

  return Object.fromEntries(
    Object.entries(update).filter(([key]) =>
      allowedKeys.includes(key as keyof UpdateRecruiterJobPayload),
    ),
  ) as UpdateRecruiterJobPayload
}
