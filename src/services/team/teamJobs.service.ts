import { apiClient } from '../../lib/api'
import type { CompanyJobListQuery, Envelope, Job, ListEnvelope } from '../../types/job.types'
import { mockJobsApi } from './mock/mockJobs'
import { shouldUseTeamMock } from './mock/mockMode'

/** Company-scoped recruiter jobs (JD) with assignee info. The backend (or mock) filters by visibility. */
export const teamJobsService = {
  async listRecruiterJobs(params?: CompanyJobListQuery): Promise<ListEnvelope<Job>> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockJobsApi.listRecruiterJobs(params)
    }

    // Existing endpoint. TODO(BE): add assigneeId, returnReason and the PENDING_APPROVAL / RETURNED statuses to the response.
    const response = await apiClient.get<ListEnvelope<Job>>('/recruiter/jobs', { params })
    return response.data
  },

  /**
   * Submit a DRAFT or RETURNED JD. Staff → PENDING_APPROVAL (returnReason cleared);
   * Manager / Owner FREE (jd.publishDirect) → PUBLISHED.
   */
  async submitRecruiterJob(id: string): Promise<Job> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockJobsApi.submitRecruiterJob(id)
    }

    // Existing endpoint. TODO(BE): Staff submissions must go to PENDING_APPROVAL and clear returnReason.
    const response = await apiClient.post<Envelope<Job>>(`/recruiter/jobs/${id}/submit`)
    return response.data.data
  },
}
