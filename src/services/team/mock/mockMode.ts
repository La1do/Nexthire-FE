/**
 * Mock switch for the company RBAC services (src/services/team).
 *
 * - Dev (`vite` / `npm run dev`): mock ON unless `VITE_USE_MOCK=false`.
 *   `.env.development` sets `VITE_USE_MOCK=true` explicitly.
 * - Production build (`import.meta.env.DEV === false`): mock is ALWAYS OFF,
 *   whatever `VITE_USE_MOCK` says.
 */
export const isTeamMockEnabled: boolean =
  import.meta.env.DEV === true && import.meta.env.VITE_USE_MOCK !== 'false'
