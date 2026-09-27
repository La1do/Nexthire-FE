import { apiClient } from '../../lib/api'
import type { CompanyResponse, CompanySubscription, Member } from '../../types/company.types'
import type { Envelope } from '../../types/job.types'
import { isTeamMockEnabled } from './mock/mockMode'
import { mockDelay, requireMockContext } from './mock/mockStore'

const mockTeamCompanyService = {
  async getCurrentCompany(): Promise<CompanyResponse> {
    const { company } = requireMockContext()
    // Strip mock-only subscription fields so the shape matches GET /companies/me.
    const { plan: _plan, seatLimit: _seatLimit, renewsAt: _renewsAt, ...response } = company
    return mockDelay(response)
  },

  async getCompanyPlan(): Promise<CompanySubscription> {
    const { company } = requireMockContext()
    return mockDelay({
      companyId: company.id,
      plan: company.plan,
      renewsAt: company.renewsAt,
      seatLimit: company.seatLimit,
    })
  },

  async listMembers(): Promise<Member[]> {
    const { company, db } = requireMockContext()
    return mockDelay(db.members.filter((member) => member.companyId === company.id))
  },
}

const realTeamCompanyService = {
  async getCurrentCompany(): Promise<CompanyResponse> {
    const response = await apiClient.get<Envelope<CompanyResponse>>('/companies/me')
    return response.data.data
  },

  async getCompanyPlan(): Promise<CompanySubscription> {
    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<Envelope<CompanySubscription>>('/companies/me/subscription')
    return response.data.data
  },

  async listMembers(): Promise<Member[]> {
    // TODO(BE): endpoint not available yet — plausible REST path.
    const response = await apiClient.get<Envelope<Member[]>>('/companies/me/members')
    return response.data.data
  },
}

/**
 * Company workspace data for the current recruiter (company, plan, members).
 * No role arguments: the backend (or mock) resolves the caller from the session.
 * TODO(A1): listInvoices, changePlan (upgrade/downgrade).
 */
export const teamCompanyService: {
  getCurrentCompany: () => Promise<CompanyResponse>
  getCompanyPlan: () => Promise<CompanySubscription>
  listMembers: () => Promise<Member[]>
} = isTeamMockEnabled ? mockTeamCompanyService : realTeamCompanyService
