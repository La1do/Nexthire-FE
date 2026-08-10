import type {
  ApplicationCvParseStatus,
  ApplicationMatchDecision,
  ApplicationMatchLevel,
  ApplicationMatchPriority,
  ApplicationMatchRecommendation,
  ApplicationStatus,
} from '../../types/application.types'

export type RecruiterApplicationStatus = ApplicationStatus

export type RecruiterApplicationSort = 'newest' | 'score-desc' | 'score-asc'

export type RecruiterApplicationTimelineItem = {
  id: string
  date: string
  description: string
  label: string
}

export type RecruiterApplicationItem = {
  id: string
  candidateEmail: string
  candidateHeadline: string
  candidateLocation: string
  candidateName: string
  candidatePhone: string
  coverLetter: string
  cvFileName: string
  cvParseStatus: ApplicationCvParseStatus
  decidedAt: string | null
  expectedSalary: string
  experience: string
  jobId: string
  jobTitle: string
  matchDecision: ApplicationMatchDecision | null
  matchLevel: ApplicationMatchLevel | null
  matchMatchedSkills: ReadonlyArray<string>
  matchMissingSkills: ReadonlyArray<string>
  matchNextActions: ReadonlyArray<string>
  matchPriority: ApplicationMatchPriority | null
  matchRecommendation: ApplicationMatchRecommendation | null
  matchRiskFlags: ReadonlyArray<string>
  matchScore: number | null
  matchSummary: string | null
  portfolioUrl?: string
  resumeUrl?: string
  skills: ReadonlyArray<string>
  status: RecruiterApplicationStatus
  statusNote: string | null
  submittedAt: string
  submittedAtOrder: number
  timeline: ReadonlyArray<RecruiterApplicationTimelineItem>
  updatedAt: string
}

export type RecruiterApplicationCriteria = {
  jobId: string | 'all'
  query: string
  sort: RecruiterApplicationSort
  status: RecruiterApplicationStatus | 'all'
}

export type RecruiterApplicationJobOption = {
  id: string
  title: string
}

export type RecruiterApplicationStats = {
  interview: number
  new: number
  responseRate: string
  total: number
}
