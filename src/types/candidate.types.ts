import type { JobType } from './job.types'
import type { Locale } from '../i18n'

export type CandidateProfileVisibility = 'PUBLIC' | 'PRIVATE'
export type CandidateSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
export type CandidateCvParseStatus = 'NOT_PARSED' | 'PARSING' | 'PARSED' | 'FAILED'

export type CandidateProfileResponse = {
  id: string
  userId: string
  fullName: string | null
  phone: string | null
  contactEmail: string | null
  avatarDocumentId: string | null
  avatarUrl: string | null
  headline: string | null
  summary: string | null
  location: string | null
  portfolioUrl: string | null
  linkedinUrl: string | null
  language?: Locale | null
  openToWork: boolean
  visibility: CandidateProfileVisibility
  createdAt: string
  updatedAt: string
}

export type CandidateSkillResponse = {
  id: string
  name: string
  level: CandidateSkillLevel | null
  yearsOfExperience: number | null
  source: string
}

export type CandidateExperienceResponse = {
  id: string
  companyName: string
  position: string
  employmentType: JobType | null
  startMonth: number | null
  startYear: number | null
  endMonth: number | null
  endYear: number | null
  isCurrent: boolean
  description: string | null
  source: string
}

export type CandidateEducationResponse = {
  id: string
  schoolName: string
  degree: string | null
  fieldOfStudy: string | null
  startYear: number | null
  endYear: number | null
  isCurrent: boolean
  description: string | null
  source: string
}

export type CandidateCertificationResponse = {
  id: string
  name: string
  issuer: string | null
  credentialUrl: string | null
  issuedYear: number | null
  description: string | null
  source: string
}

export type CandidateProjectResponse = {
  id: string
  name: string
  description: string | null
  technologies: string[]
  projectUrl: string | null
  source: string
}

export type CandidateCvResponse = {
  id: string
  documentId: string
  title: string | null
  isDefault: boolean
  parseStatus: CandidateCvParseStatus
  parsedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CandidateMeResponse = {
  profile: CandidateProfileResponse
  skills: CandidateSkillResponse[]
  experiences: CandidateExperienceResponse[]
  educations: CandidateEducationResponse[]
  certifications: CandidateCertificationResponse[]
  projects: CandidateProjectResponse[]
  defaultCv: CandidateCvResponse | null
  cvs: CandidateCvResponse[]
  completionPercent: number
}

export type CandidateProfilePayload = {
  fullName?: string | null
  phone?: string | null
  contactEmail?: string | null
  headline?: string | null
  summary?: string | null
  location?: string | null
  portfolioUrl?: string | null
  linkedinUrl?: string | null
  language?: Locale
  openToWork?: boolean
  visibility?: CandidateProfileVisibility
  avatarDocumentId?: string | null
}

export type CandidateSkillPayload = {
  name: string
  level?: CandidateSkillLevel
  yearsOfExperience?: number | null
}

export type CandidateExperiencePayload = {
  companyName: string
  position: string
  employmentType?: JobType
  startMonth?: number | null
  startYear?: number | null
  endMonth?: number | null
  endYear?: number | null
  isCurrent?: boolean
  description?: string | null
}

export type CandidateEducationPayload = {
  schoolName: string
  degree?: string | null
  fieldOfStudy?: string | null
  startYear?: number | null
  endYear?: number | null
  isCurrent?: boolean
  description?: string | null
}

export type CandidateUpdatePayload = {
  profile?: CandidateProfilePayload
  skills?: CandidateSkillPayload[]
  experiences?: CandidateExperiencePayload[]
  educations?: CandidateEducationPayload[]
}
