import type { ApplicationResponse } from '../../../types/application.types'
import type { CandidateApplication } from '../types'

export function createCandidateApplicationFromApi(
  application: ApplicationResponse,
  fallbackLabel: string,
  noCoverLetterLabel: string,
): CandidateApplication {
  const extra = application as Record<string, unknown>
  const job = extra.job as Record<string, unknown> | undefined

  const location =
    (typeof extra.location === 'string' && extra.location.trim()) ||
    (typeof job?.location === 'string' && job.location.trim()) ||
    fallbackLabel

  const workingType =
    (typeof extra.workingType === 'string' && extra.workingType.trim()) ||
    (typeof job?.workingType === 'string' && job.workingType.trim()) ||
    fallbackLabel

  const salaryLabel =
    (typeof extra.salaryLabel === 'string' && extra.salaryLabel.trim()) ||
    (typeof job?.salaryLabel === 'string' && job.salaryLabel.trim()) ||
    fallbackLabel

  return {
    appliedAt: application.submittedAt,
    companyName: application.companyName,
    coverLetter: application.coverLetter?.trim() || noCoverLetterLabel,
    currentProgressStep: application.currentProgressStep ?? application.progress?.currentProgressStep ?? null,
    cvFileName: application.cvFileName,
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    location,
    progress: application.progress ?? null,
    salaryLabel,
    status: application.status,
    updatedAt: application.updatedAt,
    workingType,
  }
}
