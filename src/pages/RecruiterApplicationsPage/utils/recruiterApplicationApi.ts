import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { ApplicationProgressEvent, ApplicationResponse } from '../../../types/application.types'
import type { RecruiterApplicationItem, RecruiterApplicationTimelineItem } from '../types'

type CreateRecruiterApplicationOptions = {
  formatDate: (value: string) => string
  meta: RecruiterApplicationsTranslations['meta']
}

function createTimelineFromProgress(
  application: ApplicationResponse,
  formatDate: (value: string) => string,
): RecruiterApplicationTimelineItem[] {
  const progressEvents = application.progress?.events ?? []

  if (progressEvents.length > 0) {
    return progressEvents.map((event: ApplicationProgressEvent) => ({
      date: formatDate(event.occurredAt),
      description: event.description ?? event.note ?? event.title,
      id: event.id,
      label: event.title,
    }))
  }

  return [
    {
      date: formatDate(application.submittedAt),
      description: `Application status: ${application.status}.`,
      id: `${application.id}-submitted`,
      label: application.jobTitle,
    },
  ]
}

export function createRecruiterApplicationFromApi(
  application: ApplicationResponse,
  { formatDate, meta }: CreateRecruiterApplicationOptions,
): RecruiterApplicationItem {
  const submittedAtOrder = Number.isNaN(Date.parse(application.submittedAt))
    ? 0
    : Date.parse(application.submittedAt)
  const matchMatchedSkills = application.matchMatchedSkills ?? []
  const matchMissingSkills = application.matchMissingSkills ?? []

  return {
    candidateEmail: application.candidateEmail,
    candidateHeadline: application.cvTitle || meta.notAvailable,
    candidateLocation: meta.notAvailable,
    candidateName: application.candidateFullName,
    candidatePhone: application.candidatePhone ?? meta.notAvailable,
    coverLetter: application.coverLetter?.trim() || meta.noCoverLetter,
    decidedAt: application.decidedAt ? formatDate(application.decidedAt) : null,
    cvFileName: application.cvFileName || application.cvTitle || meta.notAvailable,
    cvParseStatus: application.cvParseStatus ?? 'NOT_PARSED',
    expectedSalary: meta.notAvailable,
    experience: meta.notAvailable,
    id: application.id,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    matchDecision: application.matchDecision ?? null,
    matchLevel: application.matchLevel ?? null,
    matchMatchedSkills,
    matchMissingSkills,
    matchNextActions: application.matchNextActions ?? [],
    matchPriority: application.matchPriority ?? null,
    matchRecommendation: application.matchRecommendation ?? null,
    matchRiskFlags: application.matchRiskFlags ?? [],
    matchScore: application.matchScore,
    matchSummary: application.matchSummary ?? null,
    skills: matchMatchedSkills.length > 0 ? matchMatchedSkills : matchMissingSkills,
    status: application.status,
    statusNote: application.statusNote,
    submittedAt: formatDate(application.submittedAt),
    submittedAtOrder,
    timeline: createTimelineFromProgress(application, formatDate),
    updatedAt: formatDate(application.updatedAt),
  }
}
