import type { ApplicationJobListFilters, JobApplicationsRequest } from '../types'

const ROOT = 'recruiter-applications' as const

export const applicationQueryKeys = {
  all: [ROOT] as const,
  jobs: (scope: string, filters: ApplicationJobListFilters) => [ROOT, scope, 'jobs', filters] as const,
  staffMembers: (scope: string) => [ROOT, scope, 'staff-members'] as const,
  jobOptions: (scope: string) => [ROOT, scope, 'job-options'] as const,
  jobAccess: (scope: string, jobId: string) => [ROOT, scope, 'job-access', jobId] as const,
  jobApplications: (scope: string, jobId: string, request: JobApplicationsRequest) =>
    [ROOT, scope, 'job-applications', jobId, request] as const,
  jobApplicationsRoot: (scope: string, jobId: string) => [ROOT, scope, 'job-applications', jobId] as const,
  jobStats: (scope: string, jobId: string, query: string) => [ROOT, scope, 'job-stats', jobId, query] as const,
  jobStatsRoot: (scope: string, jobId: string) => [ROOT, scope, 'job-stats', jobId] as const,
  applicationDetail: (scope: string, applicationId: string) => [ROOT, scope, 'application', applicationId] as const,
  applicationJob: (scope: string, applicationId: string) => [ROOT, scope, 'application-job', applicationId] as const,
}
