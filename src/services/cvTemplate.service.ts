import { apiClient } from '../lib/api'
import type { Envelope } from '../types/job.types'
import type { CanvasDocument } from '../pages/CvBuilderPage/canvas/canvas.types'

// Bản ghi CV (freeform) trả về từ BE. contentSnapshot/layout/theme là phần
// của model cũ, ta chỉ dùng `canvas` cho CV-builder kiểu Canva.
export interface CvTemplateResponse {
  id: string
  name: string
  templateKey: string
  canvas: CanvasDocument
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCvTemplatePayload {
  name: string
  canvas: CanvasDocument
}

export interface UpdateCvTemplatePayload {
  name?: string
  canvas?: CanvasDocument
}

export const cvTemplateService = {
  async list() {
    const res = await apiClient.get<Envelope<CvTemplateResponse[]>>('/cv-templates')
    return res.data.data
  },

  async get(id: string) {
    const res = await apiClient.get<Envelope<CvTemplateResponse>>(`/cv-templates/${id}`)
    return res.data.data
  },

  async create(payload: CreateCvTemplatePayload) {
    // templateKey bắt buộc theo API cũ — CV freeform gửi giá trị hợp lệ mặc định.
    const res = await apiClient.post<Envelope<CvTemplateResponse>>('/cv-templates', {
      templateKey: 'modern',
      name: payload.name,
      canvas: payload.canvas,
    })
    return res.data.data
  },

  async update(id: string, payload: UpdateCvTemplatePayload) {
    const res = await apiClient.patch<Envelope<CvTemplateResponse>>(
      `/cv-templates/${id}`,
      payload,
    )
    return res.data.data
  },

  async remove(id: string) {
    const res = await apiClient.delete<Envelope<{ deleted: true }>>(`/cv-templates/${id}`)
    return res.data.data
  },
}
