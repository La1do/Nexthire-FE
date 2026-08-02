import type {
  JobExperienceLevel,
  JobStatus,
  JobType,
  JobWorkingType,
  PublicCategory,
  RecruiterJobResponse,
} from '../../types/job.types'

export type JobPostCurrency = 'VND' | 'USD' | 'JPY'
export type JobPostAction = 'draft' | 'submit'

export type JobPostFormValues = {
  title: string
  categoryId: string
  employmentType: JobType | ''
  workingType: JobWorkingType | ''
  experienceLevel: JobExperienceLevel | ''
  location: string
  salaryMin: string
  salaryMax: string
  salaryCurrency: JobPostCurrency
  isSalaryVisible: boolean
  deadline: string
  numberOfOpenings: string
  skills: string[]
  skillInput: string
  description: string
  requirements: string
  benefits: string
}

export type JobPostFieldErrors = Partial<Record<keyof JobPostFormValues, string>>

export type JobPostSubmitResult = {
  action: JobPostAction
  job: RecruiterJobResponse
}

export type JobPostChecklist = {
  basics: boolean
  salary: boolean
  skills: boolean
  content: boolean
  deadline: boolean
}

export type JobPostFormOptionData = {
  categories: ReadonlyArray<PublicCategory>
}

export type JobPostStatus = JobStatus
