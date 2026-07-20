import { apiClient } from '../lib/api'
import type { PublicCompanyProfile } from '../types/company.types'
import type { Envelope } from '../types/job.types'

export const companyService = {
  async getPublicCompany(id: string) {
    const response = await apiClient.get<Envelope<PublicCompanyProfile>>(`/companies/public/${id}`)
    return response.data.data
  },
}
