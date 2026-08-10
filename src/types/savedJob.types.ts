// API types for candidate saved-jobs endpoints. See BE api-docs/candidate-service.md.

import type { Envelope, ListEnvelope } from './job.types'

export type SavedJobStatus = 'PUBLISHED' | 'UNPUBLISHED' | 'CLOSED' | 'EXPIRED' | 'REJECTED'

export type SavedJobItem = {
  id: string
  jobId: string
  title: string
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  companyLogoDocumentId: string | null
  status: SavedJobStatus
  experienceLevel: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  isSalaryVisible: boolean
  deadline: string | null
  publishedAt: string | null
  savedAt: string
}

export type SavedJobListResponse = ListEnvelope<SavedJobItem>
export type SavedJobEnvelope = Envelope<SavedJobItem>

export type SavedJobListQuery = {
  page?: number
  limit?: number
}

export type SavedJobBatchStatus = {
  savedJobIds: string[]
}
export type SavedJobBatchStatusEnvelope = Envelope<SavedJobBatchStatus>

export type SavedJobSingleStatus = {
  saved: boolean
}
export type SavedJobSingleStatusEnvelope = Envelope<SavedJobSingleStatus>

export type DeleteSavedJobResponse = {
  deleted: boolean
}
export type DeleteSavedJobEnvelope = Envelope<DeleteSavedJobResponse>
