import { apiClient } from '../../lib/api'
import { authService } from '../auth.service'
import type { AuthProfile, AuthResponse, AuthUser } from '../auth.service'
import type { Envelope } from '../../types/job.types'
import { isTeamMockEnabled } from './mock/mockMode'
import {
  MOCK_TOKEN_PREFIX,
  clearMockSession,
  createMockApiError,
  mockDelay,
  readMockDb,
  requireMockContext,
  setMockSession,
} from './mock/mockStore'
import type { MockContext } from './mock/mockStore'

export type TeamLoginPayload = {
  email: string
  password: string
}

/** GET /auth/me shape including company RBAC fields. */
export type TeamAuthProfile = AuthProfile &
  Pick<AuthUser, 'companyId' | 'companyName' | 'companyRole' | 'companyMemberStatus'>

const MOCK_TOKEN_TTL_SECONDS = 60 * 60 * 24

function toMockAuthUser({ account, company, db }: MockContext): AuthUser {
  const member = db.members.find((item) => item.id === account.memberId)

  return {
    companyId: company.id,
    companyMemberStatus: member?.status ?? 'ACTIVE',
    companyName: company.name,
    companyRole: member?.role,
    email: account.email,
    emailVerified: true,
    fullName: account.fullName,
    id: account.userId,
    logoUrl: company.logoUrl ?? null,
    phone: account.phone,
    role: 'RECRUITER',
  }
}

const mockTeamAuthService = {
  async login(payload: TeamLoginPayload): Promise<AuthResponse> {
    const db = readMockDb()
    const account = db.accounts.find(
      (item) => item.email.toLowerCase() === payload.email.trim().toLowerCase() && item.password === payload.password,
    )

    if (!account) {
      throw createMockApiError(401, 'AUTH.INVALID_CREDENTIALS', 'Invalid mock email or password.')
    }

    setMockSession({ userId: account.userId })
    const user = toMockAuthUser(requireMockContext())

    return mockDelay({
      tokens: {
        accessToken: `${MOCK_TOKEN_PREFIX}access.${account.userId}`,
        accessTokenExpiresIn: MOCK_TOKEN_TTL_SECONDS,
        refreshToken: `${MOCK_TOKEN_PREFIX}refresh.${account.userId}`,
        refreshTokenExpiresIn: MOCK_TOKEN_TTL_SECONDS,
      },
      user,
    })
  },

  async getMe(): Promise<TeamAuthProfile> {
    const user = toMockAuthUser(requireMockContext())

    return mockDelay({
      companyId: user.companyId,
      companyMemberStatus: user.companyMemberStatus,
      companyName: user.companyName,
      companyRole: user.companyRole,
      email: user.email,
      fullName: user.fullName,
      id: user.id,
      logoUrl: user.logoUrl,
      phone: user.phone,
      role: user.role,
    })
  },

  async logout(): Promise<void> {
    clearMockSession()
    return mockDelay(undefined, 0)
  },
}

const realTeamAuthService = {
  async login(payload: TeamLoginPayload): Promise<AuthResponse> {
    return authService.login({ ...payload, role: 'RECRUITER' })
  },

  async getMe(): Promise<TeamAuthProfile> {
    // TODO(BE): /auth/me must return companyId, companyRole and companyMemberStatus for recruiters.
    const response = await apiClient.get<Envelope<TeamAuthProfile>>('/auth/me')
    return response.data.data
  },

  async logout(refreshToken?: string | null): Promise<void> {
    if (refreshToken) {
      await authService.logout(refreshToken)
    }
  },
}

/**
 * Recruiter auth for the company RBAC flow. Same signatures in mock and real mode
 * (switched by VITE_USE_MOCK, see ./mock/mockMode.ts).
 * `login()` returns an AuthResponse that can be passed straight to `useAuth().login()`.
 */
export const teamAuthService: {
  login: (payload: TeamLoginPayload) => Promise<AuthResponse>
  getMe: () => Promise<TeamAuthProfile>
  logout: (refreshToken?: string | null) => Promise<void>
} = isTeamMockEnabled ? mockTeamAuthService : realTeamAuthService
