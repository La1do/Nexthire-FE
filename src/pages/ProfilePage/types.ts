import type { CandidateCvParseStatus } from '../../types/candidate.types'

export type CandidateExperience = {
  company: string
  description: string
  endDate: string
  id: string
  isCurrent: boolean
  position: string
  startDate: string
}

export type CandidateEducation = {
  degree: string
  endYear: string
  id: string
  school: string
  startYear: string
}

export type CandidateProfile = {
  avatarDocumentId: string | null
  avatarUrl: string | null
  contactEmail: string
  defaultCvId: string | null
  defaultCvParseStatus: CandidateCvParseStatus | null
  education: CandidateEducation[]
  experiences: CandidateExperience[]
  headline: string
  linkedin: string
  location: string
  name: string
  phone: string
  portfolio: string
  resumeFile: string
  skills: string[]
  summary: string
}

export type CompletionKey = 'basic' | 'contact' | 'experience' | 'resume' | 'skills'

export type ProfileCompletionItem = {
  completed: boolean
  key: CompletionKey
}

export type ProfileCompletion = {
  items: ProfileCompletionItem[]
  percent: number
}
