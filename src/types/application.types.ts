import type { ApiMeta } from './job.types'

export type ApplicationStatus = 'SUBMITTED' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED'
export type ApplicationMatchLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT'
export type ApplicationCvParseStatus = 'NOT_PARSED' | 'PARSING' | 'PARSED' | 'FAILED'
export type ApplicationProgressStep = 'CV_SUBMITTED' | 'CV_RECEIVED' | 'CV_VIEWED' | 'RESPONDED' | 'CANCELLED'
export type ApplicationProgressActorType = 'SYSTEM' | 'CANDIDATE' | 'RECRUITER' | 'ADMIN'
export type ApplicationMatchRecommendation = 'GOOD_FIT' | 'PARTIAL_FIT' | 'LOW_FIT' | 'INSUFFICIENT_DATA'
export type ApplicationMatchDecision = 'SHORTLIST' | 'REVIEW_MANUALLY' | 'REJECT' | 'INSUFFICIENT_DATA'
export type ApplicationMatchPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type RecruiterApplicationMatchRequestStatus = 'PENDING' | 'WAITING_FOR_CV_PARSE'
export type RecruiterApplicationMatchRequestType = 'RECRUITER_MANUAL'

export type ApplicationProgressEvent = {
  actorType: ApplicationProgressActorType
  actorUserId: string | null
  description: string | null
  id: string
  isLatest: boolean
  metadata: Record<string, unknown> | null
  note: string | null
  occurredAt: string
  step: ApplicationProgressStep
  title: string
}

export type ApplicationProgress = {
  currentProgressStep: ApplicationProgressStep | null
  events: ApplicationProgressEvent[]
}

export type CreateApplicationPayload = {
  jobId: string
  candidateCvId: string
  coverLetter?: string | null
}

export type ApplicationResponse = {
  id: string
  jobId: string
  jobTitle: string
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  companyLogoDocumentId: string | null
  candidateId: string
  candidateUserId: string
  candidateFullName: string
  candidateEmail: string
  candidatePhone: string | null
  candidateAvatarDocumentId: string | null
  candidateAvatarUrl: string | null
  candidateCvId: string
  cvDocumentId: string
  cvTitle: string
  cvFileName: string
  cvMimeType: string
  cvSize: number
  cvParseStatus: ApplicationCvParseStatus
  coverLetter: string | null
  status: ApplicationStatus
  statusNote: string | null
  matchScore: number | null
  matchLevel: ApplicationMatchLevel | null
  matchRecommendation?: ApplicationMatchRecommendation | null
  matchDecision?: ApplicationMatchDecision | null
  matchPriority?: ApplicationMatchPriority | null
  matchSummary?: string | null
  matchMatchedSkills?: string[] | null
  matchMissingSkills?: string[] | null
  matchNextActions?: string[] | null
  matchRiskFlags?: string[] | null
  currentProgressStep?: ApplicationProgressStep | null
  firstCvReceivedAt?: string | null
  firstCvViewedAt?: string | null
  progress?: ApplicationProgress | null
  submittedAt: string
  withdrawnAt: string | null
  decidedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export type RecruiterApplicationQuery = {
  page?: number
  limit?: number
  jobId?: string
  status?: ApplicationStatus
  search?: string
}

export type RecruiterApplicationListResponse = {
  success: true
  data: ApplicationResponse[]
  meta: ApiMeta
}

export type CandidateApplicationQuery = {
  page?: number
  limit?: number
  status?: ApplicationStatus
}

export type CandidateApplicationListResponse = {
  success: true
  data: ApplicationResponse[]
  meta: ApiMeta
}

export type ApplicationCvDownloadResponse = {
  documentId: string
  fileName: string
  mimeType: string
  size: number
  url: string
  expiresInSeconds: number
}

export type UpdateRecruiterApplicationStatusPayload = {
  note?: string | null
  status: Extract<ApplicationStatus, 'OFFERED' | 'REJECTED'>
}

export type RecruiterApplicationMatchResponse = {
  applicationId: string
  id: string | null
  requestType: RecruiterApplicationMatchRequestType
  status: RecruiterApplicationMatchRequestStatus
}
