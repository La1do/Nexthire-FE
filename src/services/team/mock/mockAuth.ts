import type { AuthResponse, AuthUser } from '../../auth.service'
import type { TeamAuthProfile, TeamLoginPayload } from '../teamAuth.types'
import { createMockApiError } from './mockErrors'
import {
  MOCK_ACCESS_TOKEN_PREFIX,
  MOCK_REFRESH_TOKEN_PREFIX,
  mockDelay,
  readMockDb,
  requireMockContext,
  resolveMockContextForUser,
} from './mockStore'
import type { MockContext } from './mockStore'

const MOCK_TOKEN_TTL_SECONDS = 60 * 60 * 24

function toMockAuthUser({ account, company, member }: MockContext): AuthUser {
  return {
    companyId: company.id,
    companyMemberStatus: member.status,
    companyName: company.name,
    companyRole: member.role,
    email: account.email,
    emailVerified: true,
    fullName: account.fullName,
    id: account.userId,
    logoUrl: company.logoUrl ?? null,
    phone: account.phone,
    role: 'RECRUITER',
  }
}

function toProfile(user: AuthUser): TeamAuthProfile {
  return {
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
  }
}

/** Mock implementation of the recruiter auth endpoints. Session = the returned `mock.*` tokens. */
export const mockAuthApi = {
  async login(payload: TeamLoginPayload): Promise<AuthResponse> {
    const db = readMockDb()
    const account = db.accounts.find(
      (item) => item.email.toLowerCase() === payload.email.trim().toLowerCase() && item.password === payload.password,
    )

    if (!account) {
      throw createMockApiError(401, 'AUTH.INVALID_CREDENTIALS', 'Invalid mock email or password.')
    }

    const user = toMockAuthUser(resolveMockContextForUser(account.userId))

    return mockDelay({
      tokens: {
        accessToken: `${MOCK_ACCESS_TOKEN_PREFIX}${account.userId}`,
        accessTokenExpiresIn: MOCK_TOKEN_TTL_SECONDS,
        refreshToken: `${MOCK_REFRESH_TOKEN_PREFIX}${account.userId}`,
        refreshTokenExpiresIn: MOCK_TOKEN_TTL_SECONDS,
      },
      user,
    })
  },

  /** Works for SUSPENDED members too (the SuspendedGate needs the status). */
  async getMe(): Promise<TeamAuthProfile> {
    return mockDelay(toProfile(toMockAuthUser(requireMockContext())))
  },

  /** Nothing to revoke server-side; the AuthProvider clears the stored tokens. */
  async logout(): Promise<void> {
    return mockDelay(undefined, 0)
  },
}
