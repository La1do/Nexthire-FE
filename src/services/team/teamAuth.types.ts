import type { AuthProfile, AuthUser } from '../auth.service'

export type TeamLoginPayload = {
  email: string
  password: string
}

/** GET /auth/me shape including company RBAC fields. */
export type TeamAuthProfile = AuthProfile &
  Pick<AuthUser, 'companyId' | 'companyName' | 'companyRole' | 'companyMemberStatus'>
