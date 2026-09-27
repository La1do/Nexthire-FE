# Architecture Decisions — Company RBAC (Owner / Manager / Staff × FREE / PRO)

Skeleton written in PR A0 (`feature/rbac-contract`). Each entry: **Decision**, **Why**, **Rejected alternatives**.
Items marked (A1) were decided in A0 and are implemented in PR A1 (`feature/rbac-foundation`); ADR-17+ were added in A1.

---

## ADR-01. One permissions file + `can()`

- **Decision:** `src/lib/auth/permissions.ts` is the only place where company roles and plans are compared. It holds the permission table (plan × role → permissions), the `Permission` union and `can()`.
- **Why:** one table to review when product rules change; easy to unit-test; the backend can mirror the same table.
- **Rejected:** permission checks spread across pages/layouts; role → permission maps per feature; a policy library (no new dependencies allowed).

## ADR-02. `can(subject, permission)` with `PermissionSubject = { role, plan, status }`

- **Decision:** `can({ role, plan, status }, permission)` returns `{ allowed: true }` or `{ allowed: false, reason: 'role' | 'plan' }`. Order:
  1. `status === 'SUSPENDED'` → `{ allowed: false, reason: 'plan' }` immediately (table not consulted).
  2. `role` undefined (not a company member) → `{ allowed: false, reason: 'role' }`.
  3. Permission listed for (plan, role) → `{ allowed: true }`.
  4. Otherwise the reason follows the lead-approved rule: **result is 'plan' when no role on the current plan has the permission but another plan does; otherwise 'role'.**
- **Why:** the suspended rule lives in one pure function, so route gates and mock services that call `can()` directly cannot bypass it. The "current plan" condition keeps `PRO STAFF + jd.approve` = `role` (upgrading would not help) while `FREE OWNER + jd.approve` = `plan`; it satisfies all four brief examples (FREE OWNER + jd.approve → plan, FREE OWNER + members.manage → plan, PRO OWNER + jd.create → role, PRO STAFF + jd.approve → role).
- **Rejected:** a separate positional `status` parameter (easy to forget / pass in the wrong order); letting hooks pre-check status (a second place with permission logic that non-hook callers skip); the literal "in PRO table and not in FREE table → plan" rule (gives `plan` for PRO STAFF + jd.approve, contradicting the brief).

## ADR-03. Role-blocked = hidden, plan-blocked = locked

- **Decision:** `reason: 'role'` → the UI is hidden. `reason: 'plan'` → a locked state (PlanLock with "Upgrade to Pro") is shown.
- **Why:** a Staff member should not see Owner tools they can never get; a FREE Owner should discover PRO features (upsell).
- **Rejected:** always hide (no upsell); always show disabled (noise for roles that can never use the feature).

## ADR-04. No component compares roles

- **Decision:** components only use `usePermission(permission)` or `<Can permission fallback? lockedFallback?>` (`src/lib/auth`). These only build the subject (companyRole + companyMemberStatus from the auth user, plan from React Query) and call `can()`; no extra logic.
  - `usePermission` also returns `isLoading` (plan not fetched yet) and `isError` (plan query failed and no cached plan). In both cases the plan is **unknown**: the hook returns `{ allowed: false, reason: undefined, isLoading, isError }` — **never `reason: 'plan'`** — and `can()` is not called.
  - `<Can>` renders **nothing** while loading and on error — never `lockedFallback`, never an "Upgrade to Pro" button. A paying PRO user must not be invited to upgrade because an endpoint failed (e.g. `/companies/me/subscription` missing on the BE with `VITE_USE_MOCK=false`).
- **Why:** role checks in JSX drift from the table and are hard to find. A grep for `companyRole ===` / `'MANAGER'` / `'STAFF'` outside `permissions.ts`, types and mock seeds must return nothing.
- **Rejected:** `user.companyRole === 'OWNER'` checks in pages; role props passed down the tree; falling back to `FREE` on plan error (shows locked UI to PRO users).

## ADR-05. Keep `AuthApiRole`, add `companyRole`

- **Decision:** `AuthApiRole` (`CANDIDATE | RECRUITER | ADMIN`) and `RouteGuard` stay unchanged. `AuthUser` gets optional `companyRole?: CompanyRole` and `companyMemberStatus?: MemberStatus` (undefined → treated as `ACTIVE`).
- **Why:** platform role (which app you use) and company role (what you can do inside a company) are different axes; existing routes and guards keep working.
- **Rejected:** new platform roles such as `RECRUITER_OWNER` (breaks every route/guard/API payload); a separate auth context for the company role.
- **A1:** `companyRole` / `companyMemberStatus` (and `companyId`) are persisted with the auth user, so they can go stale. On entering the recruiter area `SuspendedGate` refetches `GET /auth/me` through `useTeamMe()` (`staleTime: 0`) and syncs the defined fields back with `updateUser()`. **Legacy mapping (real API only):** until the BE returns `companyRole`, `buildPermissionSubject()` treats a `RECRUITER` without `companyRole` as `OWNER` (with the fetched plan — FREE when `/companies/me/subscription` 404s), which keeps today's recruiter pages working. TODO(BE): return `companyRole` / `companyMemberStatus` / `companyId` from `/auth/login` and `/auth/me`.

## ADR-06. Plan via React Query, not localStorage

- **Decision:** the plan comes from `teamCompanyService.getCompanyPlan()` through `useCompanyPlan()` with the stable key `companyPlanQueryKeys` (`src/hooks`). It is never stored with the auth user.
- **Why:** plan changes (upgrade/downgrade, by another Owner or billing) must propagate by invalidating one query key; a stale persisted plan would unlock/lock the wrong UI.
- **Rejected:** storing plan in `nexhire_auth_user`; a Zustand store for plan.

## ADR-07. Route permission gate (A1)

- **Decision:** a separate `PermissionGate = { kind: 'recruiter-permission', permission }` (`src/app/routes/permissionGates.ts`, `permission` may be an array = any of), declared on the route (`permissionGate`) next to `businessGate`, and evaluated by `PermissionGateGuard` **inside the layout** (`RouteGuard → BusinessGateGuard → Layout → PermissionGateGuard → page`). Outcomes: plan unknown → loading / error + Retry (ADR-17); `reason: 'role'` → `<Navigate replace to="/recruiter">`; `reason: 'plan'` → `PlanLockPlaceholder`; allowed → page. The gate never relies on a service 403.
  - Gates: jobs, jobs/new, jobs/:id, jobs/:id/edit → `jd.create`; applications, candidates → `['cv.viewAll', 'cv.viewOwn']`; company → `company.edit`; verification → `company.legal`; home, messages, settings → none.
  - **`/recruiter/applications` is a layout route:** its `element` is `<PermissionGateGuard gate={recruiterApplicationsGate}><Outlet /></PermissionGateGuard>` and the list page is its `index: true` child (`AppRoute.children`, rendered by `App.tsx` as nested `<Route>`s). Every child inherits RouteGuard, business gate, layout and the cv.* gate, so FE Feature adds `/recruiter/applications/:jobId` as exactly one child line (`{ path: ':jobId', label, element }`).
- **Why:** the checking / locked states must render inside the recruiter shell (menu stays visible) and after the company business gates; keeping `BusinessGate` for company status and `PermissionGate` for RBAC keeps both guards small. Same declarative pattern as `businessGates`, no per-page checks.
- **Rejected:** a new `BusinessGate` kind (A0 plan — `BusinessGateGuard` renders outside the layout, so the placeholder would lose the shell); checks inside `RouteGuard`; per-page redirects; relying on the service answering 403 (Owner PRO must be redirected before any request).

## ADR-08. SuspendedGate + `GET /auth/me` refetch (A1)

- **Decision:** `src/layouts/components/SuspendedGate.tsx` wraps the whole `RecruiterLayout` shell. It uses `useTeamMe()` (fresh `/auth/me`, synced into the auth user). No data yet → checking screen; failed with no data → error + Retry + Log out; `isMemberSuspended(status)` → full-page "suspended because the plan expired — contact your company Owner to upgrade" with **only** a Log out button (no menu, no data, no upgrade button — a Staff cannot pay); otherwise the shell. Unknown is never treated as suspended. `can()` still returns `plan` for every permission when suspended, so code outside the layout stays safe.
- **Why:** one place blocks the whole recruiter area and corrects a stale persisted status before anything renders.
- **Rejected:** checking suspension in each page; logging suspended users out automatically (they need to understand why); trusting the persisted `companyMemberStatus` without a refetch.

## ADR-09. Mocks live in the service layer

- **Decision:** `src/services/team/*` expose the same signatures for real and mock implementations, switched by `VITE_USE_MOCK` (`src/services/team/mock/mockMode.ts`): ON by default in dev (`.env.development` sets `VITE_USE_MOCK=true`; to hit the real API put `VITE_USE_MOCK=false` in `.env.development.local` or the shell env — `.env` alone is overridden by `.env.development`), always OFF in production builds (`import.meta.env.DEV` is false). Mock data is persisted in localStorage under `nexhire.mock.v3.*` (prefix version bumped whenever the seed shape changes). Services take no role arguments; mocks read the current mock session. The mock filters JD/CV like the backend (ADR-19). A1 details: ADR-18 (per-session switch), ADR-19 (filtering + helpers), ADR-20 (plan change).
- **Why:** pages/hooks are written once against the real contract; switching to the backend is an env change.
- **Rejected:** MSW or json-server (new dependencies); mock data inside pages; role arguments on service functions.

## ADR-10. No new libraries

- **Decision:** no dependency changes. Drag & drop (e.g. JD assignment board) uses the existing `@dnd-kit/*`.
- **Why:** project rules require approval for new libraries; lockfiles stay untouched.
- **Rejected:** adding a policy/ACL library, MSW, or another DnD library.

## ADR-11. Two shared components in `src/pages/_components/` (FE UI)

- **Decision:** (1) shared Verification content; (2) `PlanLock` with an "Upgrade to Pro" button that only receives the `can()` result via props (used as `<Can lockedFallback={(result) => <PlanLock result={result} />}>`). Built by FE UI, not in A0.
- **Why:** consistent locked UI; no permission logic in presentational components.
- **Rejected:** PlanLock calling `usePermission` itself; per-page lock UIs.
- **A1:** until FE UI ships `PlanLock`, the permission gate renders `PlanLockPlaceholder` (`src/pages/_components/PlanLockPlaceholder.tsx`, props `{ result }`, "Upgrade to Pro" links to `RECRUITER_UPGRADE_PATH` = `/recruiter/settings` in `src/constants/recruiterPaths.ts`, TODO billing page). Swapping it is a one-line change in `PermissionGateGuard`.

## ADR-12. Per-feature i18n files and per-feature mock service files

- **Decision:** page-specific strings go in per-feature locale files (`src/i18n/locales/{en,vi,ja}/pages/<feature>.ts`, matching keys); shared strings go in `common.ts` (only add keys, never modify existing ones). Each feature owns its own mock service file (e.g. an applications/candidates feature file built on top of `teamApplicationsService`).
- **Why:** parallel work without merge conflicts in one big file.
- **Rejected:** one shared RBAC locale file; one monolithic mock file.

## ADR-13. Only FE Integration edits the menu config

- **Decision:** `RecruiterLayout` navigation items are changed only by the FE Integration owner.
- **Why:** the sidebar is a merge-conflict hotspot and depends on every feature being ready.
- **Rejected:** each feature PR adding its own menu entry.
- **A1:** the items live in `src/layouts/recruiterNavConfig.ts` (`getRecruiterNavItems(pages)`), each with an optional `permission` (same requirement as the route gate). `RecruiterLayout` evaluates them with `usePermissionSubject()` + `checkPermission()`: `role` → hidden, `plan` → shown locked (lock badge, link to the upgrade path, aria label), plan unknown → skeleton rows / small error + Retry (ADR-17). Ungated items (overview, messages, settings) always show. Owner PRO therefore sees no Jobs / Applications / Candidates items.

## ADR-14. Internal JD return uses `RETURNED`, not `REJECTED` — TODO(BE)

- **Decision:** `CompanyJobStatus = JobStatus | 'PENDING_APPROVAL' | 'RETURNED'`. A Manager sending a JD back to Staff sets `RETURNED` with `returnReason`; Staff edits and resubmits → `PENDING_APPROVAL` and `returnReason` is cleared (`null`). A1 implements it in the mock submit (`mockJobsApi.submitRecruiterJob`): DRAFT or RETURNED only (else 409); `jd.publishDirect` → PUBLISHED, `jd.submit` → PENDING_APPROVAL; `returnReason` always cleared. `REJECTED` means **only** platform moderation rejection, with the existing `reviewReason`. Audit action for the internal return is `JD_RETURNED` (no `JD_REJECTED`). **TODO(BE):** the backend must add `PENDING_APPROVAL`, `RETURNED` and `returnReason` to the job contract.
- **Why:** a JD could carry both an internal and a platform reason; one shared `REJECTED` value made the "Rejected" tab (D1) unable to classify it.
- **Rejected:** sharing `REJECTED` and distinguishing by `rejectReason` vs `reviewReason`; a separate `internalStatus` field (two status fields to keep in sync).

## ADR-15. Typed audit log metadata

- **Decision:** `AuditLog` is a discriminated union on `action` (exactly 9 actions). `metadata` is typed per action: `MEMBER_ROLE_CHANGED` → `{ fromRole, toRole }`, `MEMBER_ADDED` → `{ role }`, `PLAN_CHANGED` → `{ fromPlan, toPlan }`, `JD_RETURNED` → `{ returnReason }`, `JD_ASSIGNED` → `{ fromAssigneeId, toAssigneeId, fromAssigneeName?, toAssigneeName? }`; `JD_SUBMITTED`, `JD_APPROVED`, `JD_PUBLISHED_BY_MANAGER`, `MEMBER_REMOVED` → no metadata.
- **Why:** the audit log UI can render each row without casting `Record<string, unknown>`; the compiler catches seed/BE mismatches.
- **Rejected:** untyped `Record<string, unknown>` metadata.

## ADR-16. Structured seat limit

- **Decision:** `CompanySubscription.seatLimit: CompanySeatLimit = { MANAGER: number; STAFF: number }` (never null). FREE = `{ MANAGER: 0, STAFF: 0 }`, PRO = `{ MANAGER: 1, STAFF: 3 }`; the single Owner seat is always included. Only ACTIVE members count toward the quota; SUSPENDED members do not.
- **Why:** the Members tab shows per-role quota (e.g. "Staff 3/3"); a single number or `null` (unlimited) cannot express it.
- **Rejected:** `seatLimit: number | null`; hard-coding quotas in the Members page.

## ADR-17. Unknown access state is never FREE or suspended (A1)

- **Decision:** while the company plan (or `/auth/me`) is loading, show a loading state; when it failed and nothing is cached, show an error with **Retry** (refetch). Never fall back to FREE (no locked items, no upgrade buttons) and never to suspended. Applies to `usePermission` / `<Can>` (render nothing), `usePermissionSubject` (`{ status: 'loading' | 'error' (retry) | 'ready' (subject) }`), `PermissionGateGuard`, `SuspendedGate` and the recruiter menu. A failed background refetch keeps the last known data.
- **Why:** a paying PRO user must not be told to upgrade (or be locked out) because an endpoint failed.
- **Rejected:** defaulting to FREE / ACTIVE; hiding the whole area on error without a way to retry.

## ADR-18. Per-session mock switch + mock token guard (A1)

- **Decision:** every service call decides with `import.meta.env.DEV && shouldUseTeamMock()`: dev + mock enabled + the current access token is a mock token (`mock.access.<userId>`). Login decides by e-mail (`@mock.nexhire` recruiter accounts → mock), so a real account keeps using the real API in the same dev server. The mock session is the token itself (no separate session key). `axios.customize.ts` never sends a `mock.*` token as `Authorization` and never tries to refresh it. The explicit `import.meta.env.DEV &&` at each call site lets the bundler drop the whole mock layer from production (verified: no mock seed strings in `dist`). Existing recruiter services (`authService`, `currentUserService`, `companyService`, `jobService`, `applicationService`, `notificationService`) take the mock branch for the endpoints the recruiter shell needs; statuses are mapped for legacy pages (`PENDING_APPROVAL` → `PENDING_REVIEW`, `RETURNED` → `DRAFT`).
- **Why:** the team can switch between mock and real accounts without restarting; mock tokens can never leak to the backend.
- **Known gap:** endpoints without a mock branch (e.g. `updateMe`, `createJob`, dashboard applications) still call the real backend without a token in a mock session and fail with 401 — feature owners add mock branches in their own files (ADR-12).
- **Rejected:** a global switch by env only (cannot use real and mock accounts side by side); sending mock tokens and letting the backend reject them.

## ADR-19. Mock filtering rule and helpers for feature mocks (A1)

- **Decision:** visibility comes from `permissions.ts`, not from the mock: `getJobVisibility(subject)` — `jd.approve` or `jd.publishDirect` → all company jobs, `jd.submit` → `assigneeId === me`, else none (403); `getApplicationVisibility(subject)` — `cv.viewAll` → all, `cv.viewOwn` → job assigned to me or `handlerId === me`, else none (403). A record outside your scope → 403 (in company) / 404. Mock errors are real `AxiosError`s carrying the API error envelope (`mockForbidden`, `mockNotFound`, `mockConflict`, `mockUnauthorized`, `createMockApiError`), so existing error handling works unchanged. Feature mocks import from the barrel `src/services/team/mock` (`getCurrentMockUser()` → user + subject, `requireMockContext`, `listVisibleMockJobs`, `findVisibleMockApplication`, `updateMockDb`, `appendMockAuditLog`, `paginateMock`, `mockDelay`, …).
- **Why:** one filtering rule shared by all mocks and testable without React; the backend can mirror it.
- **Rejected:** each feature re-implementing role filters; plain `Error` objects (break `getApiErrorMessage`).

## ADR-20. Plan change side effects (A1)

- **Decision:** `teamCompanyService.changePlan(plan)` (real: `PATCH /companies/me/subscription`, TODO(BE)) requires `billing.manage`; `useChangePlan()` invalidates the plan and `me` queries, then every query. Mock side effects (`applyMockPlanChange`):
  - **Downgrade (PRO → FREE):** every ACTIVE non-owner member → `SUSPENDED` with `suspendedReason: 'PLAN_DOWNGRADE'`.
  - **Upgrade (FREE → PRO):** jobs assigned to the Owner are unassigned (Owner PRO has no `jd.*`), one `JD_ASSIGNED` audit entry each; `PLAN_DOWNGRADE` members are reactivated oldest first **within the PRO seat quota** (`PLAN_SEAT_LIMITS`); a PAID invoice is added (`listInvoices()`, real `GET /companies/me/invoices`, TODO(BE)).
  - Always a `PLAN_CHANGED` audit entry; same plan → no-op.
- **Why:** mirrors the product rules so FE Feature can build billing / members screens against realistic data.
- **Rejected:** leaving members active after a downgrade (breaks the FREE = Owner-only rule); reactivating over quota.

## ADR-21. Dev mock toolbar excluded from production (A1)

- **Decision:** `src/pages/_components/DevMockToolbar.tsx` (not in the `_components` barrel) is `lazy()`-imported in `App.tsx` only when `import.meta.env.DEV` and rendered only when mock mode is on: switch account (mock login → `useAuth().login` → clear queries → `/recruiter`), switch the current company plan (same side effects, no permission check), reset the mock DB. Its strings live in `src/i18n/locales/*/pages/devMockToolbar.ts` and are imported by the toolbar directly (not registered in the global `Translations`) so they stay out of production bundles.
- **Why:** fast manual testing of every role × plan without polluting production.
- **Rejected:** a query-string backdoor; shipping the toolbar behind a runtime flag.
