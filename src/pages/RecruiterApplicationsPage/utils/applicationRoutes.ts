export const APPLICATION_JOBS_PATH = '/recruiter/applications'

export function getJobApplicationsHref(jobId: string, searchParams?: URLSearchParams) {
  const search = searchParams?.toString() ?? ''
  return `${APPLICATION_JOBS_PATH}/${encodeURIComponent(jobId)}${search ? `?${search}` : ''}`
}
