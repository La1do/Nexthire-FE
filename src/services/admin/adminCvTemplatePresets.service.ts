import { apiClient } from '../../lib/api'
import type {
  AdminCvTemplatePreset,
  AdminCvTemplatePresetQuery,
  AdminCvTemplatePresetSortOrderPayload,
  CreateAdminCvTemplatePresetPayload,
  UpdateAdminCvTemplatePresetPayload,
} from '../../types/cvTemplatePreset.types'
import type { ApiSuccessEnvelope, PaginatedEnvelope } from '../../types/admin.types'

function toPresetParams(query: AdminCvTemplatePresetQuery) {
  return {
    ...query,
    includeCanvas:
      query.includeCanvas === undefined ? undefined : String(query.includeCanvas),
  }
}

export const adminCvTemplatePresetsService = {
  async list(query: AdminCvTemplatePresetQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminCvTemplatePreset>>(
      '/admin/cv-template-presets',
      {
        params: toPresetParams(query),
      },
    )
    return response.data
  },

  async get(id: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      `/admin/cv-template-presets/${id}`,
    )
    return response.data.data
  },

  async create(payload: CreateAdminCvTemplatePresetPayload) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      '/admin/cv-template-presets',
      payload,
    )
    return response.data.data
  },

  async update(id: string, payload: UpdateAdminCvTemplatePresetPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      `/admin/cv-template-presets/${id}`,
      payload,
    )
    return response.data.data
  },

  async publish(id: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      `/admin/cv-template-presets/${id}/publish`,
    )
    return response.data.data
  },

  async archive(id: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      `/admin/cv-template-presets/${id}/archive`,
    )
    return response.data.data
  },

  async restore(id: string) {
    const response = await apiClient.post<ApiSuccessEnvelope<AdminCvTemplatePreset>>(
      `/admin/cv-template-presets/${id}/restore`,
    )
    return response.data.data
  },

  async updateSortOrder(payload: AdminCvTemplatePresetSortOrderPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCvTemplatePreset[]>>(
      '/admin/cv-template-presets/sort-order',
      payload,
    )
    return response.data.data
  },
}
