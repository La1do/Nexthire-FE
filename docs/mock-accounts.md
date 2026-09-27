# Mock accounts — Company RBAC (dev only)

Used by `src/services/team/*` when mock mode is on (`npm run dev`, `VITE_USE_MOCK` not `false`).
Production builds never use mocks. All data is fake.
To use the real API in dev: `VITE_USE_MOCK=false npm run dev`, or put `VITE_USE_MOCK=false` in `.env.development.local` (gitignored).

Password for every account: `123456`

| Email | Company | Plan | Company role | Status |
| --- | --- | --- | --- | --- |
| `owner.free@mock.nexhire` | Mock Free Company | FREE | OWNER | ACTIVE |
| `owner.pro@mock.nexhire` | Mock Pro Company | PRO | OWNER | ACTIVE |
| `manager.pro@mock.nexhire` | Mock Pro Company | PRO | MANAGER | ACTIVE |
| `staff1.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |
| `staff2.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |
| `staff3.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |
| `suspended.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | SUSPENDED |

## Seed summary

- Jobs: 6 in Mock Pro Company (PUBLISHED / PENDING_APPROVAL / DRAFT / REJECTED, with `assigneeId` on Manager and Staff, one unassigned), 2 in Mock Free Company.
- Applications: 4 in Mock Pro Company (`handlerId` on Manager / Staff, one unhandled), 1 in Mock Free Company.
- Audit logs: 4 in Mock Pro Company.

## Storage

- `localStorage["nexhire.mock.v1.db"]` — mock database (seeded on first read).
- `localStorage["nexhire.mock.v1.session"]` — current mock user id (set by `teamAuthService.login`).
- Reset: remove both keys (or call `resetMockDb()` from `src/services/team/mock/mockStore.ts`).

## Logging in (A0)

`teamAuthService.login({ email, password })` returns an `AuthResponse` (fake `mock.*` tokens, `user.companyRole`, `user.companyMemberStatus`) that can be passed to `useAuth().login(auth)`.
A0 does not wire this into the Login page; that integration (and mocking the existing recruiter endpoints such as `/companies/me`) is A1 work.
