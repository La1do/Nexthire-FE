import type {
  RecruiterApplicationCriteria,
  RecruiterApplicationItem,
  RecruiterApplicationJobOption,
} from '../types'

export function normalizeApplicationQuery(value: string): string {
  return value.trim().toLowerCase()
}

export function getRecruiterApplicationJobs(
  applications: ReadonlyArray<RecruiterApplicationItem>,
): RecruiterApplicationJobOption[] {
  const jobs = new Map<string, string>()

  for (const application of applications) {
    jobs.set(application.jobId, application.jobTitle)
  }

  return Array.from(jobs, ([id, title]) => ({ id, title })).sort((first, second) =>
    first.title.localeCompare(second.title),
  )
}

export function filterRecruiterApplications(
  applications: ReadonlyArray<RecruiterApplicationItem>,
  criteria: RecruiterApplicationCriteria,
): RecruiterApplicationItem[] {
  const query = normalizeApplicationQuery(criteria.query)

  const filtered = applications.filter((application) => {
    if (criteria.status !== 'all' && application.status !== criteria.status) {
      return false
    }

    if (criteria.jobId !== 'all' && application.jobId !== criteria.jobId) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      application.candidateEmail,
      application.candidateHeadline,
      application.candidateLocation,
      application.candidateName,
      application.cvFileName,
      application.jobTitle,
      ...application.matchMatchedSkills,
      ...application.matchMissingSkills,
      ...application.skills,
    ].join(' ').toLowerCase()

    return haystack.includes(query)
  })

  return filtered.sort((first, second) => {
    if (criteria.sort === 'score-desc') {
      return (second.matchScore ?? -1) - (first.matchScore ?? -1)
    }

    if (criteria.sort === 'score-asc') {
      return (first.matchScore ?? 101) - (second.matchScore ?? 101)
    }

    return second.submittedAtOrder - first.submittedAtOrder
  })
}

export function isActiveRecruiterApplicationFilters(criteria: RecruiterApplicationCriteria): boolean {
  return (
    normalizeApplicationQuery(criteria.query).length > 0 ||
    criteria.jobId !== 'all' ||
    criteria.status !== 'all' ||
    criteria.sort !== 'newest'
  )
}
