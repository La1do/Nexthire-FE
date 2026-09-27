/**
 * Feature-owned service for single-CV actions of the applications workspace:
 * CV detail, CV file link, AI match and the Offer/Reject decision.
 *
 * Real: thin wrapper over the existing `applicationService` endpoints (unchanged).
 * Mock (dev only, `import.meta.env.DEV && isTeamMockEnabled`, same switch as the
 * other workspace services): reads/writes the A0 team mock DB so the BE can stay OFF.
 * - Scope: same rule as the lists (`findMockApplicationInScope`) → 403 outside my JDs.
 * - CV file: one tiny sample PDF served from a blob URL.
 * - AI match: fixed sample result, written immediately.
 * - Decision: SUBMITTED → OFFERED / REJECTED written to the mock DB, so list rows,
 *   stats and JD group counts update on refetch.
 */
import { applicationService } from '../application.service'
import type {
  Application,
  ApplicationCvDownloadResponse,
  ApplicationResponse,
  RecruiterApplicationMatchResponse,
  UpdateRecruiterApplicationStatusPayload,
} from '../../types/application.types'
import { isTeamMockEnabled } from '../team'
import { mockDelay, requireMockContext } from '../team/mock/mockStore'
import { createConflictError, createNotFoundError } from './forbiddenError'
import { MOCK_CV_URL_TTL_SECONDS, buildSampleCvPdf, createMockAiMatchResult } from './workspaceMockFixtures'
import { findMockApplicationInScope } from './workspaceMockScope'
import { updateWorkspaceMockDb } from './workspaceMockStore'

type ApplicationDetailService = {
  /** One CV in the caller's scope; Axios-shaped 403 / 404 otherwise. */
  getApplication: (applicationId: string) => Promise<Application>
  /** Short-lived link to the CV file. */
  getApplicationCv: (applicationId: string) => Promise<ApplicationCvDownloadResponse>
  /** Starts an AI match for the CV. */
  runApplicationMatch: (applicationId: string) => Promise<RecruiterApplicationMatchResponse>
  /** Offer / reject a SUBMITTED CV. */
  decideApplication: (applicationId: string, payload: UpdateRecruiterApplicationStatusPayload) => Promise<Application>
}

// The existing BE does not send handlerId yet (TODO(BE)); normalize to null.
function normalizeApplication(application: ApplicationResponse): Application {
  return { ...application, handlerId: (application as Partial<Application>).handlerId ?? null }
}

/** Applies `patch` to the stored CV (mock DB) and returns the stored result. */
function patchMockApplication(applicationId: string, patch: (application: Application) => Partial<Application>) {
  return updateWorkspaceMockDb((db) => {
    const application = db.applications.find((item) => item.id === applicationId)

    if (!application) {
      throw createNotFoundError('Application not found.', 'APPLICATION.NOT_FOUND')
    }

    Object.assign(application, patch(application), { updatedAt: new Date().toISOString() })
    return { ...application }
  })
}

/* ---------------------------------------------------------------- mock --- */

const REVOKE_SAMPLE_CV_URL_MS = MOCK_CV_URL_TTL_SECONDS * 1000

const mockApplicationDetailService: ApplicationDetailService = {
  async getApplication(applicationId) {
    return mockDelay(await findMockApplicationInScope(applicationId))
  },

  async getApplicationCv(applicationId) {
    const application = await findMockApplicationInScope(applicationId)
    const pdf = buildSampleCvPdf()
    const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }))
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_SAMPLE_CV_URL_MS)

    return mockDelay({
      documentId: application.cvDocumentId,
      expiresInSeconds: MOCK_CV_URL_TTL_SECONDS,
      fileName: application.cvFileName,
      mimeType: 'application/pdf',
      size: pdf.length,
      url,
    })
  },

  async runApplicationMatch(applicationId) {
    await findMockApplicationInScope(applicationId)
    patchMockApplication(applicationId, () => ({ ...createMockAiMatchResult(), cvParseStatus: 'PARSED' }))

    return mockDelay({
      applicationId,
      id: `mock-match-${applicationId}`,
      requestType: 'RECRUITER_MANUAL',
      status: 'PENDING',
    })
  },

  async decideApplication(applicationId, { note, status }) {
    const current = await findMockApplicationInScope(applicationId)

    if (current.status !== 'SUBMITTED') {
      throw createConflictError('This CV already has a result.', 'APPLICATION.ALREADY_DECIDED')
    }

    const { account } = requireMockContext()
    const decidedAt = new Date().toISOString()
    // TODO(A0): no audit action exists for CV decisions in the AuditLog contract (9 actions), so none is written.
    const updated = patchMockApplication(applicationId, (application) => ({
      decidedAt,
      handlerId: application.handlerId ?? account.userId,
      status,
      statusNote: note?.trim() || null,
    }))

    return mockDelay(updated)
  },
}

/* ---------------------------------------------------------------- real --- */

const realApplicationDetailService: ApplicationDetailService = {
  async getApplication(applicationId) {
    return normalizeApplication(await applicationService.getRecruiterApplication(applicationId))
  },

  getApplicationCv: (applicationId) => applicationService.getRecruiterApplicationCv(applicationId),

  runApplicationMatch: (applicationId) => applicationService.runRecruiterApplicationMatch(applicationId),

  async decideApplication(applicationId, payload) {
    return normalizeApplication(await applicationService.updateRecruiterApplicationStatus(applicationId, payload))
  },
}

export const applicationDetailService: ApplicationDetailService =
  // `import.meta.env.DEV &&` lets the bundler drop the mock variant (and its fixtures) from production builds.
  import.meta.env.DEV && isTeamMockEnabled
  ? mockApplicationDetailService
  : realApplicationDetailService
