import type { ApiMeta } from './job.types'

export type ApplicationStatus = 'SUBMITTED' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED'
export type ApplicationMatchLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXCELLENT'

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
  cvParseStatus: string
  coverLetter: string | null
  status: ApplicationStatus
  statusNote: string | null
  matchScore: number | null
  matchLevel: ApplicationMatchLevel | null
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
