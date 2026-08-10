import { apiClient } from '../lib/api'
import type { Envelope, PublicCategory } from '../types/job.types'

export const categoryService = {
  async getCategories() {
    const response = await apiClient.get<Envelope<PublicCategory[]>>('/categories')
    return response.data.data
  },
}
