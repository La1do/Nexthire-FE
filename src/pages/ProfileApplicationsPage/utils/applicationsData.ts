import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationFilter, ApplicationStatsValue, CandidateApplication, CandidateApplicationStatus } from '../types'

const activeStatuses = new Set<CandidateApplicationStatus>(['SUBMITTED', 'REVIEWING', 'INTERVIEW'])
const closedStatuses = new Set<CandidateApplicationStatus>(['OFFERED', 'REJECTED', 'WITHDRAWN'])

export function createCandidateApplications(
  source: ProfileTranslations['applications']['items'],
): CandidateApplication[] {
  return source.map((application) => ({ ...application }))
}

export function filterCandidateApplications(
  applications: ReadonlyArray<CandidateApplication>,
  filter: ApplicationFilter,
) {
  if (filter === 'all') {
    return applications
  }

  return applications.filter((application) => application.status === filter)
}

export function getApplicationStats(applications: ReadonlyArray<CandidateApplication>): ApplicationStatsValue {
  return applications.reduce<ApplicationStatsValue>(
    (stats, application) => {
      stats.total += 1

      if (activeStatuses.has(application.status)) {
        stats.active += 1
      }

      if (application.status === 'INTERVIEW') {
        stats.interviews += 1
      }

      if (closedStatuses.has(application.status)) {
        stats.closed += 1
      }

      return stats
    },
    {
      active: 0,
      closed: 0,
      interviews: 0,
      total: 0,
    },
  )
}
