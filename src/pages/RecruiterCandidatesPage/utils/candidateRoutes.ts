const APPLICATIONS_PATH = '/recruiter/applications'

/** Tier-2 applications page of one JD (D4). */
export function getJobApplicationsHref(jobId: string) {
  return `${APPLICATIONS_PATH}/${encodeURIComponent(jobId)}`
}

/** One CV opened inside its JD page. */
export function getJobApplicationHref(jobId: string, applicationId: string) {
  return `${getJobApplicationsHref(jobId)}?${new URLSearchParams({ applicationId }).toString()}`
}
