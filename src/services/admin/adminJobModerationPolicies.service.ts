import { apiClient } from '../../lib/api'
import type { ApiSuccessEnvelope } from '../../types/admin.types'
import type {
  CreateJobModerationPolicyPayload,
  JobModerationPolicy,
  JobModerationPolicyListQuery,
  JobModerationRules,
  JobModerationTestResult,
  TestJobModerationPolicyPayload,
  UpdateJobModerationPolicyPayload,
} from '../../types/jobModerationPolicy.types'

function unwrapData<TData>(payload: TData | ApiSuccessEnvelope<TData>): TData {
  return payload && typeof payload === 'object' && 'data' in payload
    ? payload.data
    : payload
}

export const adminJobModerationPoliciesService = {
  async list(query: JobModerationPolicyListQuery = {}) {
    const response = await apiClient.get<
      JobModerationPolicy[] | ApiSuccessEnvelope<JobModerationPolicy[]>
    >(
      '/admin/job-moderation-policies',
      { params: query },
    )
    return unwrapData(response.data)
  },

  async getDefaultRules() {
    const response = await apiClient.get<JobModerationRules | ApiSuccessEnvelope<JobModerationRules>>(
      '/admin/job-moderation-policies/default-rules',
    )
    return unwrapData(response.data)
  },

  async get(policyId: string) {
    const response = await apiClient.get<JobModerationPolicy | ApiSuccessEnvelope<JobModerationPolicy>>(
      `/admin/job-moderation-policies/${policyId}`,
    )
    return unwrapData(response.data)
  },

  async create(payload: CreateJobModerationPolicyPayload) {
    const response = await apiClient.post<JobModerationPolicy | ApiSuccessEnvelope<JobModerationPolicy>>(
      '/admin/job-moderation-policies',
      payload,
    )
    return unwrapData(response.data)
  },

  async update(policyId: string, payload: UpdateJobModerationPolicyPayload) {
    const response = await apiClient.patch<JobModerationPolicy | ApiSuccessEnvelope<JobModerationPolicy>>(
      `/admin/job-moderation-policies/${policyId}`,
      payload,
    )
    return unwrapData(response.data)
  },

  async publish(policyId: string) {
    const response = await apiClient.post<JobModerationPolicy | ApiSuccessEnvelope<JobModerationPolicy>>(
      `/admin/job-moderation-policies/${policyId}/publish`,
    )
    return unwrapData(response.data)
  },

  async archive(policyId: string) {
    const response = await apiClient.post<JobModerationPolicy | ApiSuccessEnvelope<JobModerationPolicy>>(
      `/admin/job-moderation-policies/${policyId}/archive`,
    )
    return unwrapData(response.data)
  },

  async test(payload: TestJobModerationPolicyPayload) {
    const response = await apiClient.post<
      JobModerationTestResult | ApiSuccessEnvelope<JobModerationTestResult>
    >('/admin/job-moderation-policies/test', payload)

    return unwrapData(response.data)
  },
}
