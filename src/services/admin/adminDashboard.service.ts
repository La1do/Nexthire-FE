import { apiClient } from '../../lib/api'
import type {
  AdminCompanyGrowthSummary,
  AdminDashboardGrowthQuery,
  AdminDashboardOverview,
  AdminJobGrowthSummary,
  AdminUserGrowthSummary,
  ApiSuccessEnvelope,
} from '../../types/admin.types'

export const adminDashboardService = {
  async getOverview() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminDashboardOverview>>(
      '/admin/dashboard/overview',
    )
    return response.data.data
  },

  async getUserGrowth(query: AdminDashboardGrowthQuery = {}) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminUserGrowthSummary>>(
      '/admin/dashboard/users/growth',
      { params: query },
    )
    return response.data.data
  },

  async getCompanyGrowth(query: AdminDashboardGrowthQuery = {}) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminCompanyGrowthSummary>>(
      '/admin/dashboard/companies/growth',
      { params: query },
    )
    return response.data.data
  },

  async getJobGrowth(query: AdminDashboardGrowthQuery = {}) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminJobGrowthSummary>>(
      '/admin/dashboard/jobs/growth',
      { params: query },
    )
    return response.data.data
  },
}
