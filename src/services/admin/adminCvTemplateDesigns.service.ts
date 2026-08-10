import { apiClient } from '../../lib/api'
import type { CvTemplateDesignJob } from '../../types/cvTemplateDesign.types'
import type { ApiSuccessEnvelope } from '../../types/admin.types'

export const adminCvTemplateDesignsService = {
  /**
   * Trả về 202 kèm job QUEUED — BE xử lý nền, FE poll bằng get().
   * Không set Content-Type: để axios tự sinh boundary cho FormData.
   */
  async create(file: File) {
    const form = new FormData()
    form.append('file', file)

    const response = await apiClient.post<ApiSuccessEnvelope<CvTemplateDesignJob>>(
      '/admin/cv-template-designs',
      form,
    )
    return response.data.data
  },

  async get(id: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<CvTemplateDesignJob>>(
      `/admin/cv-template-designs/${id}`,
    )
    return response.data.data
  },
}
