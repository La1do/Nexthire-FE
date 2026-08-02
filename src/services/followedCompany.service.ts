import { apiClient } from '../lib/api'
import type {
  CompanyBatchFollowStatus,
  CompanyFollowStatus,
  FollowCompanyDeleteResult,
  FollowedCompaniesList,
  FollowedCompaniesQuery,
  FollowedCompany,
} from '../types/followedCompany.types'
import type { Envelope, ListEnvelope } from '../types/job.types'

function encodeId(id: string) {
  return encodeURIComponent(id)
}

export const followedCompanyService = {
  async followCompany(companyId: string) {
    const response = await apiClient.post<Envelope<FollowedCompany>>(
      `/followed-companies/${encodeId(companyId)}`,
    )
    return response.data.data
  },

  async unfollowCompany(companyId: string) {
    const response = await apiClient.delete<Envelope<FollowCompanyDeleteResult>>(
      `/followed-companies/${encodeId(companyId)}`,
    )
    return response.data.data
  },

  async listFollowedCompanies(params?: FollowedCompaniesQuery): Promise<FollowedCompaniesList> {
    const response = await apiClient.get<ListEnvelope<FollowedCompany>>('/followed-companies', {
      params,
    })

    return {
      data: response.data.data,
      meta: response.data.meta,
    }
  },

  async getBatchFollowStatus(companyIds: ReadonlyArray<string>) {
    if (companyIds.length === 0) {
      return { followedCompanyIds: [] }
    }

    const response = await apiClient.get<Envelope<CompanyBatchFollowStatus>>(
      '/followed-companies/status',
      {
        params: { companyIds: companyIds.join(',') },
      },
    )
    return response.data.data
  },

  async getFollowStatus(companyId: string) {
    const response = await apiClient.get<Envelope<CompanyFollowStatus>>(
      `/followed-companies/${encodeId(companyId)}/status`,
    )
    return response.data.data
  },
}
