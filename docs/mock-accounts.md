# Mock accounts — Company RBAC (dev only)

Used by `src/services/team/*` when mock mode is on (`npm run dev`, `VITE_USE_MOCK` not `false`).
Production builds never use mocks. All data is fake.
To use the real API in dev: `VITE_USE_MOCK=false npm run dev`, or put `VITE_USE_MOCK=false` in `.env.development.local` (gitignored).

Password for every account: `123456`

| Email | Company | Plan | Company role | Status |
| --- | --- | --- | --- | --- |
| `owner.free@mock.nexhire` | Mock Free Company | FREE | OWNER | ACTIVE |
| `suspended.free@mock.nexhire` | Mock Free Company | FREE | STAFF | SUSPENDED (locked by the PRO → FREE downgrade) |
| `owner.pro@mock.nexhire` | Mock Pro Company | PRO | OWNER | ACTIVE |
| `manager.pro@mock.nexhire` | Mock Pro Company | PRO | MANAGER | ACTIVE |
| `staff1.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |
| `staff2.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |
| `staff3.pro@mock.nexhire` | Mock Pro Company | PRO | STAFF | ACTIVE |

## Seed summary

- Mock Pro Company: exactly 1 Owner, 1 Manager, 3 Staff (all ACTIVE) — fills the PRO quota `seatLimit = { MANAGER: 1, STAFF: 3 }`.
- Mock Free Company: 1 Owner (ACTIVE) + 1 Staff SUSPENDED (simulates the state after a PRO → FREE downgrade; suspended members do not count toward seats). FREE quota: `seatLimit = { MANAGER: 0, STAFF: 0 }`.
- Jobs: 6 in Mock Pro Company (PUBLISHED / PENDING_APPROVAL / DRAFT / RETURNED, with `assigneeId` on Manager and Staff, one unassigned; the RETURNED one belongs to Staff One with a `returnReason`), 2 in Mock Free Company.
- Applications: 4 in Mock Pro Company (`handlerId` on Manager / Staff, one unhandled), 1 in Mock Free Company.
- Audit logs: 5 in Mock Pro Company (MEMBER_ADDED, JD_SUBMITTED, JD_RETURNED, JD_APPROVED, JD_ASSIGNED), 1 in Mock Free Company (PLAN_CHANGED PRO → FREE).

## Storage

- `localStorage["nexhire.mock.v2.db"]` — mock database (seeded on first read).
- `localStorage["nexhire.mock.v2.session"]` — current mock user id (set by `teamAuthService.login`).
- Reset: remove both keys (or call `resetMockDb()` from `src/services/team/mock/mockStore.ts`).

## Logging in (A0)

`teamAuthService.login({ email, password })` returns an `AuthResponse` (fake `mock.*` tokens, `user.companyRole`, `user.companyMemberStatus`) that can be passed to `useAuth().login(auth)`.
A0 does not wire this into the Login page; that integration (and mocking the existing recruiter endpoints such as `/companies/me`) is A1 work.
