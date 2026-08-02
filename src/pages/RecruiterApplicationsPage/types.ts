export type RecruiterApplicationStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'

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
  expectedSalary: string
  experience: string
  jobId: string
  jobTitle: string
  portfolioUrl?: string
  resumeUrl: string
  score: number
  skills: ReadonlyArray<string>
  status: RecruiterApplicationStatus
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
