import axios from 'axios'
import { apiClient } from '../../lib/api'
import { PLAN_SEAT_LIMITS } from '../../lib/auth/permissions'
import type {
  CompanyPlan,
  CompanyResponse,
  CompanySubscription,
  Invoice,
  Member,
} from '../../types/company.types'
import type { Envelope } from '../../types/job.types'
import { mockCompanyApi } from './mock/mockCompany'
import { shouldUseTeamMock } from './mock/mockMode'

/**
 * Company workspace data for the current recruiter (company, plan, members, billing).
 * No role arguments: the backend (or mock) resolves the caller from the session.
 */
export const teamCompanyService = {
  async getCurrentCompany(): Promise<CompanyResponse> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockCompanyApi.getCurrentCompany()
    }

    const response = await apiClient.get<Envelope<CompanyResponse>>('/companies/me')
    return response.data.data
  },

  async getCompanyPlan(): Promise<CompanySubscription> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockCompanyApi.getCompanyPlan()
    }

    try {
      // TODO(BE): endpoint not available yet — plausible REST path.
      const response = await apiClient.get<Envelope<CompanySubscription>>('/companies/me/subscription')
      return response.data.data
    } catch (error) {
      // TODO(BE): temporary real-API fallback — plan endpoint 404 is treated as FREE (keeps today's behavior).
      // Remove once the BE returns companyRole / companyMemberStatus / companyId and a plan endpoint.
      // ONLY status 404 is caught: any other failure (network, 401, 403, 5xx) is rethrown, so the plan stays
      // unknown and gates / menu show loading or error + Retry (never FREE).
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { companyId: '', plan: 'FREE', renewsAt: null, seatLimit: { ...PLAN_SEAT_LIMITS.FREE } }
      }

      throw error
    }
  },

  async listMembers(): Promise<Member[]> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockCompanyApi.listMembers()
    }

    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<Envelope<Member[]>>('/companies/me/members')
    return response.data.data
  },

  /** Upgrade / downgrade (billing.manage). Side effects are applied by the backend (or mock). */
  async changePlan(plan: CompanyPlan): Promise<CompanySubscription> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockCompanyApi.changePlan(plan)
    }

    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.patch<Envelope<CompanySubscription>>('/companies/me/subscription', { plan })
    return response.data.data
  },

  /** Invoice history, newest first (billing.manage). */
  async listInvoices(): Promise<Invoice[]> {
    if (import.meta.env.DEV && shouldUseTeamMock()) {
      return mockCompanyApi.listInvoices()
    }

    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<Envelope<Invoice[]>>('/companies/me/invoices')
    return response.data.data
  },
}
