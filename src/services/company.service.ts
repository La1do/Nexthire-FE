import { apiClient } from '../lib/api'
import type {
  CompanyResponse,
  CreateCompanyPayload,
  PublicCompanyProfile,
  UpdateCompanyPayload,
} from '../types/company.types'
import type { Envelope } from '../types/job.types'

export const companyService = {
  async getPublicCompany(id: string) {
    const response = await apiClient.get<Envelope<PublicCompanyProfile>>(`/companies/public/${id}`)
    return response.data.data
  },
  async getMyCompany() {
    const response = await apiClient.get<Envelope<CompanyResponse>>('/companies/me')
    return response.data.data
  },
  async createCompany(payload: CreateCompanyPayload) {
    const response = await apiClient.post<Envelope<CompanyResponse>>('/companies', payload)
    return response.data.data
  },
  async updateCompany(id: string, payload: UpdateCompanyPayload) {
    const response = await apiClient.put<Envelope<CompanyResponse>>(`/companies/${id}`, payload)
    return response.data.data
  },
}
