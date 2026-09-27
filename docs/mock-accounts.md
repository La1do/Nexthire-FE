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

- Invoices: 3 PAID in Mock Pro Company, 1 in Mock Free Company (`teamCompanyService.listInvoices()`, Owner only).

## What each account can do (mock enforces the same rules as `can()`)

| Account | Jobs | Applications | Audit log | Invoices / change plan | Members | Recruiter menu |
| --- | --- | --- | --- | --- | --- | --- |
| Owner FREE | all (2) | all (1) | 403 | yes | yes | all items |
| Owner PRO | 403 | 403 | yes | yes | yes | no Jobs / Applications / Candidates; `/recruiter/applications`, `/recruiter/jobs` redirect to `/recruiter` |
| Manager | all (6) | all (4) | 403 | 403 | yes | all items (Company page is view-only) |
| Staff One | own (2, `assigneeId`) | own (1) | 403 | 403 | yes | all items (Company page is view-only) |
| Suspended (FREE) | 403 | 403 | 403 | 403 | 403 | full-page "suspended" screen + Log out only |

403 responses are real `AxiosError`s with the usual error envelope (`error.code = 'AUTH.FORBIDDEN'`). The Owner PRO dashboard currently shows its error state because its applications request gets 403 (known, owned by Task C).

## Storage

- `localStorage["nexhire.mock.v3.db"]` — mock database (seeded on first read).
- The mock session is the access token itself: `mock.access.<userId>` (stored like any token by `useAuth().login`). There is no separate session key anymore.
- Reset: the dev toolbar "Reset mock data" button, or remove the key / call `resetMockDb()`.

## Logging in

- Recruiter login page: log in with any account above and password `123456` (`authService.login` routes `@mock.nexhire` recruiter e-mails to the mock in dev).
- Dev toolbar (bottom-left "Mock" pill, dev only): switch account, switch the current company plan (runs the downgrade / upgrade side effects), reset.
- A real account logged in on the same dev server keeps using the real API (the switch is per session, by token).

## Helpers for feature mocks

Import from `src/services/team/mock`: `getCurrentMockUser()` (user + permission subject), `requireMockContext()`, `listVisibleMockJobs` / `findVisibleMockJob`, `listVisibleMockApplications` / `findVisibleMockApplication`, `readMockDb` / `updateMockDb`, `appendMockAuditLog`, `paginateMock`, `mockDelay`, and the error helpers `mockForbidden` / `mockNotFound` / `mockConflict` / `mockUnauthorized`. Always call them behind `import.meta.env.DEV && shouldUseTeamMock()` so production drops them.
