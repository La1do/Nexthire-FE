// API types for public job/category endpoints. See BE api-docs/job-service.md.

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
export type JobWorkingType = 'ONSITE' | 'REMOTE' | 'HYBRID'
export type JobExperienceLevel = 'INTERN' | 'FRESHER' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD'

export type ApiMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Envelope<TData> = {
  success: true
  data: TData
}

export type ListEnvelope<TItem> = {
  success: true
  data: TItem[]
  meta: ApiMeta
}

// GET /api/v1/jobs — list item for job cards. No description/requirements here.
export type PublicJobListItem = {
  id: string
  title: string
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  companyLogoDocumentId: string | null
  skills: string[]
  categoryId: string | null
  employmentType: JobType
  workingType: JobWorkingType
  experienceLevel: JobExperienceLevel
  location: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  isSalaryVisible: boolean
  deadline: string | null
  publishedAt: string | null
}

// GET /api/v1/jobs/:id — full public detail. List item plus long-form fields.
export type PublicJobDetail = PublicJobListItem & {
  description: string
  requirements: string
  benefits: string | null
  numberOfOpenings: number | null
  createdAt: string
  updatedAt: string
}

// GET /api/v1/jobs/featured-companies
export type PublicFeaturedCompany = {
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  companyLogoDocumentId: string | null
  activeJobCount: number
  latestPublishedAt: string | null
}

// GET /api/v1/jobs/home/stats
export type PublicHomeStats = {
  publishedJobCount: number
  activeCompanyCount: number
  categoryCount: number
}

// GET /api/v1/categories
export type PublicCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  activeJobCount: number
}

export type JobListQuery = {
  page?: number
  limit?: number
  q?: string
  skills?: string
  location?: string
  employmentType?: JobType
  workingType?: JobWorkingType
  experienceLevel?: JobExperienceLevel
  categoryId?: string
  salaryMin?: number
  salaryMax?: number
  sort?: 'relevance' | 'latest' | 'deadline_asc' | 'salary_desc' | 'salary_asc'
}
