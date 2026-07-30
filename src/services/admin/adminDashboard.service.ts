import { apiClient } from '../../lib/api'
import type { AdminDashboardOverview, ApiSuccessEnvelope } from '../../types/admin.types'

export const adminDashboardService = {
  async getOverview() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminDashboardOverview>>(
      '/admin/dashboard/overview',
    )
    return response.data.data
  },
}
