export type CompanyVerificationStatus =
  | 'NO_COMPANY'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

export type CompanyVerificationFormValues = {
  name: string
  taxCode: string
  website: string
  address: string
  logo: string
  description: string
  documents: ReadonlyArray<string>
}

export type RecruiterCompany = {
  id: string
  address: string
  completion: number
  description: string
  logo: string
  name: string
  rejectionReason?: string
  status: CompanyVerificationStatus
  submittedAt: string
  taxCode: string
  website: string
}

export type RecruiterStatTone = 'amber' | 'blue' | 'coral' | 'green'

export type RecruiterStat = {
  id: string
  delta: string
  label: string
  tone: RecruiterStatTone
  value: string
}

export type RecruiterQuickAction = {
  id: string
  description: string
  disabledWhenUnverified?: boolean
  href: string
  label: string
}

export type RecruiterPipelineItem = {
  id: string
  count: number
  label: string
  tone: RecruiterStatTone
}

export type RecruiterApplication = {
  id: string
  candidateName: string
  role: string
  score: string
  stage: string
  submittedAt: string
}

export type RecruiterPerformancePoint = {
  id: string
  label: string
  value: number
}

export type RecruiterTask = {
  id: string
  description: string
  label: string
  tone: RecruiterStatTone
}
