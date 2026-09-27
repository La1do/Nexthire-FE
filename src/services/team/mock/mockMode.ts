import { authTokenStorage, isMockToken } from '../../../lib/api'

/**
 * Mock switch for the company RBAC flow.
 *
 * - Dev (`npm run dev`): mock available unless `VITE_USE_MOCK=false`
 *   (`.env.development` sets `VITE_USE_MOCK=true` explicitly).
 * - Production build (`import.meta.env.DEV === false`): ALWAYS OFF, whatever `VITE_USE_MOCK` says.
 */
export const isTeamMockEnabled: boolean =
  import.meta.env.DEV === true && import.meta.env.VITE_USE_MOCK !== 'false'

/** Seeded mock accounts all use this e-mail domain. */
export const MOCK_ACCOUNT_EMAIL_DOMAIN = '@mock.nexhire'

export function isMockAccountEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(MOCK_ACCOUNT_EMAIL_DOMAIN)
}

/**
 * Per-call switch used by every service: true only in dev, with mock enabled, while the current
 * session was created by the mock login (access token `mock.*`). A real login in dev keeps using
 * the real API, and mock tokens never reach the backend (see src/lib/api/mockToken.ts).
 */
export function shouldUseTeamMock(): boolean {
  return import.meta.env.DEV === true && isTeamMockEnabled && isMockToken(authTokenStorage.getAccessToken())
}

/** Login decides by e-mail: seeded `@mock.nexhire` recruiter accounts go to the mock. */
export function shouldUseTeamMockLogin(email: string): boolean {
  return import.meta.env.DEV === true && isTeamMockEnabled && isMockAccountEmail(email)
}
