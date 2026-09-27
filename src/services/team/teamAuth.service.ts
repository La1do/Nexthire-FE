import { apiClient, isMockToken } from '../../lib/api'
import { authService } from '../auth.service'
import type { AuthResponse } from '../auth.service'
import type { Envelope } from '../../types/job.types'
import { mockAuthApi } from './mock/mockAuth'
import { shouldUseTeamMock, shouldUseTeamMockLogin } from './mock/mockMode'
import type { TeamAuthProfile, TeamLoginPayload } from './teamAuth.types'

export type { TeamAuthProfile, TeamLoginPayload } from './teamAuth.types'

/**
 * Recruiter auth for the company RBAC flow. Same signatures in mock and real mode.
 * Mock is used per call: login with a seeded `@mock.nexhire` e-mail (dev + VITE_USE_MOCK),
 * everything else while the session token is a `mock.*` token (see ./mock/mockMode.ts).
 * `login()` returns an AuthResponse that can be passed straight to `useAuth().login()`.
 */
export const teamAuthService = {
  async login(payload: TeamLoginPayload): Promise<AuthResponse> {
    if (shouldUseTeamMockLogin(payload.email)) {
      return mockAuthApi.login(payload)
    }

    return authService.login({ ...payload, role: 'RECRUITER' })
  },

  async getMe(): Promise<TeamAuthProfile> {
    if (shouldUseTeamMock()) {
      return mockAuthApi.getMe()
    }

    // TODO(BE): /auth/me must return companyId, companyRole and companyMemberStatus for recruiters.
    const response = await apiClient.get<Envelope<TeamAuthProfile>>('/auth/me')
    return response.data.data
  },

  async logout(refreshToken?: string | null): Promise<void> {
    if (isMockToken(refreshToken) || shouldUseTeamMock()) {
      return mockAuthApi.logout()
    }

    if (refreshToken) {
      await authService.logout(refreshToken)
    }
  },
}
