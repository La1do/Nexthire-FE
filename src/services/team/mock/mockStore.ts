import { AxiosError, AxiosHeaders } from 'axios'
import type { ApiErrorEnvelope } from '../../../lib/api/apiError'
import type { ApiMeta } from '../../../types/job.types'
import { createMockSeed } from './mockSeed'
import type { MockAccount, MockCompany, MockDatabase } from './mockSeed'

/** All mock data lives under this localStorage namespace. Bump the version when the seed shape changes. */
export const MOCK_STORAGE_PREFIX = 'nexhire.mock.v1'
const DB_KEY = `${MOCK_STORAGE_PREFIX}.db`
const SESSION_KEY = `${MOCK_STORAGE_PREFIX}.session`

export const MOCK_TOKEN_PREFIX = 'mock.'

type MockSession = {
  userId: string
}

export function readMockDb(): MockDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (raw) {
      return JSON.parse(raw) as MockDatabase
    }
  } catch {
    // Corrupted mock data → reseed below.
  }

  const seed = createMockSeed()
  writeMockDb(seed)
  return seed
}

export function writeMockDb(db: MockDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

/** Drop every mock change and go back to the seed data. */
export function resetMockDb() {
  localStorage.removeItem(DB_KEY)
  return readMockDb()
}

export function getMockSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as MockSession) : null
  } catch {
    return null
  }
}

export function setMockSession(session: MockSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearMockSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function createMockApiError(status: number, code: string, message: string) {
  const data: ApiErrorEnvelope = { success: false, error: { code, message } }
  const config = { headers: new AxiosHeaders() }

  return new AxiosError(message, String(status), config, null, {
    config,
    data,
    headers: {},
    status,
    statusText: code,
  })
}

export type MockContext = {
  db: MockDatabase
  account: MockAccount
  company: MockCompany
}

/**
 * Resolve the currently logged-in mock account. Mock services read the caller
 * from here instead of taking role arguments, so A1 can add per-assignee
 * filtering without changing any service signature.
 */
export function requireMockContext(): MockContext {
  const session = getMockSession()
  const db = readMockDb()
  const account = session ? db.accounts.find((item) => item.userId === session.userId) : undefined

  if (!account) {
    throw createMockApiError(401, 'AUTH.UNAUTHORIZED', 'Mock session not found. Log in with a mock account.')
  }

  const company = db.companies.find((item) => item.id === account.companyId)

  if (!company) {
    throw createMockApiError(404, 'COMPANY.NOT_FOUND', 'Mock company not found.')
  }

  return { account, company, db }
}

export function paginateMock<TItem>(items: TItem[], page = 1, limit = 20) {
  const safeLimit = Math.max(1, limit)
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * safeLimit
  const meta: ApiMeta = {
    limit: safeLimit,
    page: safePage,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
  }

  return {
    data: items.slice(start, start + safeLimit),
    meta,
    success: true as const,
  }
}

/** Small artificial latency so loading states are visible in dev. */
export function mockDelay<TValue>(value: TValue, ms = 150): Promise<TValue> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms)
  })
}
