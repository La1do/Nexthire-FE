import type {
  CreateRecruiterJobPayload,
  JobExperienceLevel,
  JobType,
  JobWorkingType,
} from '../../../types/job.types'
import type { JobPostFormValues } from '../types'

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function createDeadlineIso(value: string) {
  if (!value.trim()) {
    return null
  }

  return new Date(`${value}T17:00:00`).toISOString()
}

export function createJobPostPayload(values: JobPostFormValues): CreateRecruiterJobPayload {
  const salaryMin = values.isSalaryVisible ? parseOptionalNumber(values.salaryMin) : null
  const salaryMax = values.isSalaryVisible ? parseOptionalNumber(values.salaryMax) : null
  const numberOfOpenings = parseOptionalNumber(values.numberOfOpenings)
  const benefits = values.benefits.trim()
  const categoryId = values.categoryId.trim()

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    requirements: values.requirements.trim(),
    skills: values.skills.map((skill) => skill.trim()).filter(Boolean),
    benefits: benefits || null,
    categoryId: categoryId || null,
    employmentType: values.employmentType as JobType,
    workingType: values.workingType as JobWorkingType,
    experienceLevel: values.experienceLevel as JobExperienceLevel,
    location: values.location.trim(),
    salaryMin,
    salaryMax,
    salaryCurrency: values.salaryCurrency,
    isSalaryVisible: values.isSalaryVisible,
    deadline: createDeadlineIso(values.deadline),
    numberOfOpenings,
  }
}
