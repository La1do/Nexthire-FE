import type {
  RecruiterApplicationItem,
  RecruiterApplicationStats,
  RecruiterApplicationStatus,
} from '../types'

export const recruiterApplicationsFixture: ReadonlyArray<RecruiterApplicationItem> = []

export function computeRecruiterApplicationStats(
  applications: ReadonlyArray<RecruiterApplicationItem>,
): RecruiterApplicationStats {
  const respondedStatuses = new Set<RecruiterApplicationStatus>(['OFFERED', 'REJECTED'])
  const responded = applications.filter((application) => respondedStatuses.has(application.status)).length
  const responseRate = applications.length > 0 ? Math.round((responded / applications.length) * 100) : 0

  return {
    interview: responded,
    new: applications.filter((application) => application.status === 'SUBMITTED').length,
    responseRate: `${responseRate}%`,
    total: applications.length,
  }
}
