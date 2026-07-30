import { apiClient } from '../../lib/api'
import type {
  AdminCompany,
  AdminCompanyListQuery,
  AdminCompanyOverview,
  AdminReasonPayload,
  ApiSuccessEnvelope,
  CompanyTrustHistory,
  CompanyVerificationActionPayload,
  CompanyVerificationDocument,
  CompanyVerificationDocumentDownload,
  PaginatedEnvelope,
  UpdateCompanyTrustLevelPayload,
} from '../../types/admin.types'

function toCompanyParams(query: AdminCompanyListQuery) {
  return {
    ...query,
    hasRejectedBefore:
      query.hasRejectedBefore === undefined ? undefined : String(query.hasRejectedBefore),
  }
}

export const adminCompaniesService = {
  async list(query: AdminCompanyListQuery = {}) {
    const response = await apiClient.get<PaginatedEnvelope<AdminCompany>>('/admin/companies', {
      params: toCompanyParams(query),
    })
    return response.data
  },

  async listPending() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminCompany[]>>(
      '/admin/companies/pending',
    )
    return response.data.data
  },

  async getOverview() {
    const response = await apiClient.get<ApiSuccessEnvelope<AdminCompanyOverview>>(
      '/admin/companies/overview',
    )
    return response.data.data
  },

  async listVerificationDocuments(companyId: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<CompanyVerificationDocument[]>>(
      `/admin/companies/${companyId}/verification-documents`,
    )
    return response.data.data
  },

  async getVerificationDocumentDownload(companyId: string, documentId: string) {
    const response = await apiClient.get<
      ApiSuccessEnvelope<CompanyVerificationDocumentDownload>
    >(`/admin/companies/${companyId}/verification-documents/${documentId}/download-url`)
    return response.data.data
  },

  async verify(companyId: string, payload: CompanyVerificationActionPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCompany>>(
      `/admin/companies/${companyId}/verify`,
      payload,
    )
    return response.data.data
  },

  async suspend(companyId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCompany>>(
      `/admin/companies/${companyId}/suspend`,
      payload,
    )
    return response.data.data
  },

  async restore(companyId: string, payload: AdminReasonPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCompany>>(
      `/admin/companies/${companyId}/restore`,
      payload,
    )
    return response.data.data
  },

  async updateTrustLevel(companyId: string, payload: UpdateCompanyTrustLevelPayload) {
    const response = await apiClient.patch<ApiSuccessEnvelope<AdminCompany>>(
      `/admin/companies/${companyId}/trust-level`,
      payload,
    )
    return response.data.data
  },

  async getTrustHistory(companyId: string) {
    const response = await apiClient.get<ApiSuccessEnvelope<CompanyTrustHistory[]>>(
      `/admin/companies/${companyId}/trust-history`,
    )
    return response.data.data
  },
}
