import { apiClient } from '../lib/api'
import type {
  CompanyResponse,
  CompanyVerificationDocument,
  CompanyVerificationDocumentType,
  CreateCompanyPayload,
  PublicCompanyProfile,
  UploadedCompanyDocument,
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
    const response = await apiClient.patch<Envelope<CompanyResponse>>(`/companies/${id}`, payload)
    return response.data.data
  },
  async uploadLogo(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.patch<Envelope<CompanyResponse>>(`/companies/${id}/logo`, formData)
    return response.data.data
  },
  async uploadHeroImage(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.patch<Envelope<CompanyResponse>>(`/companies/${id}/hero-image`, formData)
    return response.data.data
  },
  async listVerificationDocuments(id: string) {
    const response = await apiClient.get<Envelope<CompanyVerificationDocument[]>>(
      `/companies/${id}/verification-documents`,
    )
    return response.data.data
  },
  async uploadVerificationDocument(
    companyId: string,
    file: File,
    documentType: 'CERTIFICATE' | 'OTHER',
  ) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    formData.append('ownerType', 'company')
    formData.append('ownerId', companyId)
    const response = await apiClient.post<Envelope<UploadedCompanyDocument>>('/documents/upload', formData)
    return response.data.data
  },
  async attachVerificationDocument(
    companyId: string,
    documentId: string,
    type: CompanyVerificationDocumentType,
  ) {
    const response = await apiClient.post<Envelope<CompanyVerificationDocument>>(
      `/companies/${companyId}/verification-documents`,
      { documentId, type },
    )
    return response.data.data
  },
  async deleteVerificationDocument(companyId: string, documentId: string) {
    const response = await apiClient.delete<Envelope<{ deleted: true }>>(
      `/companies/${companyId}/verification-documents/${documentId}`,
    )
    return response.data.data
  },
}
