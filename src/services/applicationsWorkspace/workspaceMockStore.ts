/**
 * Mock-only write access to the A0 team mock DB (localStorage `nexhire.mock.v2.db`),
 * imported from `src/services/team/mock` without modifying it.
 *
 * TODO(A1): replace with `updateMockDb` from `src/services/team/mock` when it lands on
 * develop (it exists only on feature/rbac-foundation today). Same storage, same semantics:
 * read → mutate → persist in one step.
 */
import { readMockDb, writeMockDb } from '../team/mock/mockStore'
import type { MockDatabase } from '../team/mock/mockSeed'

export function updateWorkspaceMockDb<TResult>(mutate: (db: MockDatabase) => TResult): TResult {
  const db = readMockDb()
  const result = mutate(db)
  writeMockDb(db)
  return result
}
