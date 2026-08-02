import { apiClient } from '../../lib/api'
import type {
  AdminAiConfig,
  AdminAiUsageLog,
  AdminAiUsageLogQuery,
  AdminAiUsageSummary,
  ApiSuccessEnvelope,
  PaginatedEnvelope,
  UpdateAdminAiConfigPayload,
} from '../../types/admin.types'

export const adminAiManagementService = {
  async getConfig() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminAiConfig>>('/admin/ai-configs')
    return response.data.data
  },

  async updateConfig(payload: UpdateAdminAiConfigPayload) {
    const response = await apiClient.put<ApiSuccessEnvelope<AdminAiConfig>>('/admin/ai-configs', payload)
    return response.data.data
  },

  async getUsageSummary() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminAiUsageSummary[]>>('/admin/ai-configs/usage-summary')
    return response.data.data
  },

  async getUsageLogs(query: AdminAiUsageLogQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminAiUsageLog>>('/admin/ai-configs/usage-logs', { params: query })
    return response.data
  },
}
