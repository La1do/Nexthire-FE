import type { Locale } from '../i18n/types'
import type { CanvasDocument } from '../pages/CvBuilderPage/canvas/canvas.types'

export type CvTemplatePresetCategory = 'it' | 'marketing' | 'sales' | 'hr'

export type CvTemplatePresetCategoryFilter = CvTemplatePresetCategory | 'all'

export type CvTemplatePresetStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type CvTemplatePresetStatusFilter = CvTemplatePresetStatus | 'all'

export type CvTemplatePresetI18n = Record<Locale, string>

export type PublicCvTemplatePreset = {
  id: string
  key: string
  name: CvTemplatePresetI18n
  description: CvTemplatePresetI18n
  categories: CvTemplatePresetCategory[]
  accent: string | null
  thumbnailUrl: string | null
  canvas: CanvasDocument | null
  version: number
  createdAt: string
  updatedAt: string
}

export type AdminCvTemplatePreset = PublicCvTemplatePreset & {
  status: CvTemplatePresetStatus
  sortOrder: number
  deletedAt: string | null
}

export type PublicCvTemplatePresetQuery = {
  category?: CvTemplatePresetCategoryFilter
  includeCanvas?: boolean
}

export type AdminCvTemplatePresetQuery = {
  page?: number
  limit?: number
  search?: string
  status?: CvTemplatePresetStatusFilter
  category?: CvTemplatePresetCategoryFilter
  includeCanvas?: boolean
}

export type AdminCvTemplatePresetI18nInput = Partial<CvTemplatePresetI18n>

export type CreateAdminCvTemplatePresetPayload = {
  key: string
  defaultName: string
  defaultDescription: string
  name?: AdminCvTemplatePresetI18nInput
  description?: AdminCvTemplatePresetI18nInput
  categories: CvTemplatePresetCategory[]
  accent?: string
  thumbnailUrl?: string
  canvas: CanvasDocument
  sortOrder?: number
}

export type UpdateAdminCvTemplatePresetPayload = Partial<CreateAdminCvTemplatePresetPayload>

export type AdminCvTemplatePresetSortOrderPayload = {
  items: Array<{
    id: string
    sortOrder: number
  }>
}
