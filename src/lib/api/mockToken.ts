/**
 * Tokens issued by the dev-only company RBAC mock (src/services/team/mock) start with this prefix.
 * They must never reach the real backend: the api client does not attach them and never refreshes them.
 */
export const MOCK_TOKEN_PREFIX = 'mock.'

export function isMockToken(token: string | null | undefined): token is string {
  return typeof token === 'string' && token.startsWith(MOCK_TOKEN_PREFIX)
}
