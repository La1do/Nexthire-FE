import type { ApplicationResponse } from '../../../types/application.types'
import type { CandidateApplication } from '../types'

export function createCandidateApplicationFromApi(
  application: ApplicationResponse,
  fallbackLabel: string,
  noCoverLetterLabel: string,
): CandidateApplication {
  return {
    appliedAt: application.submittedAt,
    companyName: application.companyName,
    coverLetter: application.coverLetter?.trim() || noCoverLetterLabel,
    cvFileName: application.cvFileName,
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    location: fallbackLabel,
    salaryLabel: fallbackLabel,
    status: application.status,
    updatedAt: application.updatedAt,
    workingType: fallbackLabel,
  }
}
