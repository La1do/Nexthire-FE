import { MOCK_TOKEN_PREFIX, authTokenStorage, isMockToken } from '../../../lib/api'
import { buildPermissionSubject } from '../../../lib/auth/permissions'
import type { PermissionSubject } from '../../../lib/auth/permissions'
import type { AuditLog } from '../../../types/auditLog.types'
import type { CompanyRole, Member, MemberStatus } from '../../../types/company.types'
import type { ApiMeta } from '../../../types/job.types'
import { mockNotFound, mockUnauthorized } from './mockErrors'
import { createMockSeed } from './mockSeed'
import type { MockAccount, MockCompany, MockDatabase } from './mockSeed'

/** All mock data lives under this localStorage namespace. Bump the version when the seed shape changes. */
export const MOCK_STORAGE_PREFIX = 'nexhire.mock.v3'
const DB_KEY = `${MOCK_STORAGE_PREFIX}.db`

/** Access token format of a mock session: `mock.access.<userId>`. */
export const MOCK_ACCESS_TOKEN_PREFIX = `${MOCK_TOKEN_PREFIX}access.`
export const MOCK_REFRESH_TOKEN_PREFIX = `${MOCK_TOKEN_PREFIX}refresh.`

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

/** Read → mutate → persist in one step. Returns whatever `mutate` returns. */
export function updateMockDb<TResult>(mutate: (db: MockDatabase) => TResult): TResult {
  const db = readMockDb()
  const result = mutate(db)
  writeMockDb(db)
  return result
}

/** Drop every mock change and go back to the seed data. */
export function resetMockDb() {
  localStorage.removeItem(DB_KEY)
  return readMockDb()
}

/** User id of the current mock session, read from the stored `mock.access.<userId>` token. */
export function getMockSessionUserId(): string | null {
  const token = authTokenStorage.getAccessToken()

  if (!isMockToken(token) || !token.startsWith(MOCK_ACCESS_TOKEN_PREFIX)) {
    return null
  }

  return token.slice(MOCK_ACCESS_TOKEN_PREFIX.length) || null
}

export type MockCurrentUser = {
  userId: string
  memberId: string
  email: string
  fullName: string
  role: CompanyRole
  status: MemberStatus
  member: Member
  account: MockAccount
  company: MockCompany
  /** Ready-to-use subject for `can()` / `getJobVisibility()` / `getApplicationVisibility()`. */
  subject: PermissionSubject
}

export type MockContext = MockCurrentUser & {
  db: MockDatabase
}

function resolveMockUser(db: MockDatabase, userId: string | null): MockContext {
  const account = userId ? db.accounts.find((item) => item.userId === userId) : undefined

  if (!account) {
    throw mockUnauthorized()
  }

  const company = db.companies.find((item) => item.id === account.companyId)
  const member = db.members.find((item) => item.id === account.memberId)

  if (!company || !member) {
    throw mockNotFound('COMPANY.NOT_FOUND', 'Mock company not found.')
  }

  return {
    account,
    company,
    db,
    email: account.email,
    fullName: account.fullName,
    member,
    memberId: member.id,
    role: member.role,
    status: member.status,
    subject: buildPermissionSubject(
      { companyMemberStatus: member.status, companyRole: member.role, role: 'RECRUITER' },
      company.plan,
    ),
    userId: account.userId,
  }
}

/**
 * Current mock user (account + member + company + permission subject) from the mock session.
 * Throws an Axios-shaped 401 when there is no mock session. Reusable from per-feature mock files.
 */
export function getCurrentMockUser(): MockCurrentUser {
  return requireMockContext()
}

/** Same as getCurrentMockUser() plus the loaded database, for services that read or mutate data. */
export function requireMockContext(): MockContext {
  return resolveMockUser(readMockDb(), getMockSessionUserId())
}

/** Resolve a specific account (used by the mock login before the session token is stored). */
export function resolveMockContextForUser(userId: string): MockContext {
  return resolveMockUser(readMockDb(), userId)
}

let auditSequence = 0

/** An AuditLog without the generated fields, keeping the per-action metadata union intact. */
export type NewMockAuditLog = AuditLog extends infer TLog
  ? TLog extends AuditLog
    ? Omit<TLog, 'id' | 'createdAt'>
    : never
  : never

/** Append an audit log entry (listed newest first). */
export function appendMockAuditLog(db: MockDatabase, entry: NewMockAuditLog) {
  auditSequence += 1
  db.auditLogs.push({
    ...entry,
    createdAt: new Date().toISOString(),
    id: `mock-audit-${Date.now()}-${auditSequence}`,
  } as AuditLog)
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
    setTimeout(() => resolve(value), ms)
  })
}
