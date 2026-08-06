import { apiClient } from '../lib/api'
import type { Envelope } from '../types/job.types'
import type {
  PublicCvTemplatePreset,
  PublicCvTemplatePresetQuery,
} from '../types/cvTemplatePreset.types'

function toPresetParams(query: PublicCvTemplatePresetQuery) {
  return {
    ...query,
    includeCanvas:
      query.includeCanvas === undefined ? undefined : String(query.includeCanvas),
  }
}

export const cvTemplatePresetService = {
  async list(query: PublicCvTemplatePresetQuery = {}) {
    const response = await apiClient.get<Envelope<PublicCvTemplatePreset[]>>(
      '/cv-template-presets',
      {
        params: toPresetParams(query),
      },
    )
    return response.data.data
  },

  async get(idOrKey: string) {
    const response = await apiClient.get<Envelope<PublicCvTemplatePreset>>(
      `/cv-template-presets/${idOrKey}`,
    )
    return response.data.data
  },
}
