/**
 * Public helpers of the company RBAC mock layer, for per-feature mock files, e.g.
 *
 *   import { getCurrentMockUser, listVisibleMockJobs, mockForbidden, mockDelay } from '../team/mock'
 *
 * Everything here is dev-only in practice: services call it behind `shouldUseTeamMock()`,
 * which is statically false in production builds.
 */
export { createMockApiError, mockConflict, mockForbidden, mockNotFound, mockUnauthorized } from './mockErrors'
export { isMockAccountEmail, isTeamMockEnabled, shouldUseTeamMock, shouldUseTeamMockLogin } from './mockMode'
export {
  MOCK_STORAGE_PREFIX,
  appendMockAuditLog,
  getCurrentMockUser,
  getMockSessionUserId,
  mockDelay,
  paginateMock,
  readMockDb,
  requireMockContext,
  resetMockDb,
  updateMockDb,
  writeMockDb,
} from './mockStore'
export type { MockContext, MockCurrentUser, NewMockAuditLog } from './mockStore'
export type { MockAccount, MockCompany, MockDatabase } from './mockSeed'
export { MOCK_PASSWORD } from './mockSeed'
export { findVisibleMockJob, listVisibleMockJobs } from './mockJobs'
export { findVisibleMockApplication, listVisibleMockApplications } from './mockApplications'
