import { apiClient } from '../../lib/api'
import type { CompanyJobListQuery, Job, ListEnvelope } from '../../types/job.types'
import { isTeamMockEnabled } from './mock/mockMode'
import { mockDelay, paginateMock, requireMockContext } from './mock/mockStore'

const mockTeamJobsService = {
  async listRecruiterJobs(params: CompanyJobListQuery = {}): Promise<ListEnvelope<Job>> {
    const { company, db } = requireMockContext()
    // A0: company scope + simple filters only. TODO(A1): filter by assigneeId for STAFF, like the BE.
    const query = params.q?.trim().toLowerCase()
    const jobs = db.jobs.filter(
      (job) =>
        job.companyId === company.id &&
        (!params.status || job.status === params.status) &&
        (!query || job.title.toLowerCase().includes(query)),
    )

    return mockDelay(paginateMock(jobs, params.page, params.limit))
  },
}

const realTeamJobsService = {
  async listRecruiterJobs(params?: CompanyJobListQuery): Promise<ListEnvelope<Job>> {
    // Existing endpoint. TODO(BE): add assigneeId, rejectReason and PENDING_APPROVAL status to the response.
    const response = await apiClient.get<ListEnvelope<Job>>('/recruiter/jobs', { params })
    return response.data
  },
}

/** Company-scoped recruiter jobs (JD) with assignee info. */
export const teamJobsService: {
  listRecruiterJobs: (params?: CompanyJobListQuery) => Promise<ListEnvelope<Job>>
} = isTeamMockEnabled ? mockTeamJobsService : realTeamJobsService
