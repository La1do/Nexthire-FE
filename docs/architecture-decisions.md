# Architecture Decisions — Company RBAC (Owner / Manager / Staff × FREE / PRO)

Skeleton written in PR A0 (`feature/rbac-contract`). Each entry: **Decision**, **Why**, **Rejected alternatives**.
Items marked (A1) are decided here but implemented later.

---

## ADR-01. One permissions file + `can()`

- **Decision:** `src/lib/auth/permissions.ts` is the only place where company roles and plans are compared. It holds the permission table (plan × role → permissions), the `Permission` union and `can()`.
- **Why:** one table to review when product rules change; easy to unit-test; the backend can mirror the same table.
- **Rejected:** permission checks spread across pages/layouts; role → permission maps per feature; a policy library (no new dependencies allowed).

## ADR-02. `can(subject, permission)` with `PermissionSubject = { role, plan, status }`

- **Decision:** `can({ role, plan, status }, permission)` returns `{ allowed: true }` or `{ allowed: false, reason: 'role' | 'plan' }`. Order: `status === 'SUSPENDED'` → `plan` immediately (table not consulted); `role` undefined (not a member) → `role`; in table → allowed; permission not offered by any role of the current plan but offered by another plan (in PRO, not in FREE) → `plan`; otherwise → `role`.
- **Why:** the suspended rule lives in one pure function, so route gates and mock services that call `can()` directly cannot bypass it. The "current plan" condition keeps `PRO STAFF + jd.approve` = `role` (upgrading would not help) while `FREE OWNER + jd.approve` = `plan`.
- **Rejected:** a separate positional `status` parameter (easy to forget / pass in the wrong order); letting hooks pre-check status (a second place with permission logic that non-hook callers skip).

## ADR-03. Role-blocked = hidden, plan-blocked = locked

- **Decision:** `reason: 'role'` → the UI is hidden. `reason: 'plan'` → a locked state (PlanLock with "Upgrade to Pro") is shown.
- **Why:** a Staff member should not see Owner tools they can never get; a FREE Owner should discover PRO features (upsell).
- **Rejected:** always hide (no upsell); always show disabled (noise for roles that can never use the feature).

## ADR-04. No component compares roles

- **Decision:** components only use `usePermission(permission)` or `<Can permission fallback? lockedFallback?>` (`src/lib/auth`). These only build the subject (companyRole + companyMemberStatus from the auth user, plan from React Query) and call `can()`; no extra logic. `<Can>` renders nothing while the plan is loading.
- **Why:** role checks in JSX drift from the table and are hard to find. A grep for `companyRole ===` / `'MANAGER'` / `'STAFF'` outside `permissions.ts`, types and mock seeds must return nothing.
- **Rejected:** `user.companyRole === 'OWNER'` checks in pages; role props passed down the tree.

## ADR-05. Keep `AuthApiRole`, add `companyRole`

- **Decision:** `AuthApiRole` (`CANDIDATE | RECRUITER | ADMIN`) and `RouteGuard` stay unchanged. `AuthUser` gets optional `companyRole?: CompanyRole` and `companyMemberStatus?: MemberStatus` (undefined → treated as `ACTIVE`).
- **Why:** platform role (which app you use) and company role (what you can do inside a company) are different axes; existing routes and guards keep working.
- **Rejected:** new platform roles such as `RECRUITER_OWNER` (breaks every route/guard/API payload); a separate auth context for the company role.

## ADR-06. Plan via React Query, not localStorage

- **Decision:** the plan comes from `teamCompanyService.getCompanyPlan()` through `useCompanyPlan()` with the stable key `companyPlanQueryKeys` (`src/hooks`). It is never stored with the auth user.
- **Why:** plan changes (upgrade/downgrade, by another Owner or billing) must propagate by invalidating one query key; a stale persisted plan would unlock/lock the wrong UI.
- **Rejected:** storing plan in `nexhire_auth_user`; a Zustand store for plan.

## ADR-07. Permission gate follows the `businessGates` pattern (A1)

- **Decision:** route-level permission checks will be a new `BusinessGate` kind handled by `BusinessGateGuard`, calling `can()`. Not implemented in A0; no route is added in A0.
- **Why:** reuse the existing, reviewed gate mechanism instead of a second guard system.
- **Rejected:** permission checks inside `RouteGuard`; per-page redirects.

## ADR-08. SuspendedGate (A1)

- **Decision:** a `SuspendedGate` placed in `RecruiterLayout`. A suspended member sees only a "suspended due to plan" screen + logout. `can()` already returns `plan` for every permission when suspended.
- **Why:** one place blocks the whole recruiter area; `can()` stays correct even for code that bypasses the layout.
- **Rejected:** checking suspension in each page; logging suspended users out automatically (they need to understand why).

## ADR-09. Mocks live in the service layer

- **Decision:** `src/services/team/*` expose the same signatures for real and mock implementations, switched by `VITE_USE_MOCK` (`src/services/team/mock/mockMode.ts`): ON by default in dev (`.env.development` sets `VITE_USE_MOCK=true`; to hit the real API put `VITE_USE_MOCK=false` in `.env.development.local` or the shell env — `.env` alone is overridden by `.env.development`), always OFF in production builds (`import.meta.env.DEV` is false). Mock data is persisted in localStorage under `nexhire.mock.v1.*`. Services take no role arguments; mocks read the current mock session. In A1 the mock filters JD/CV by `assigneeId` / `handlerId` like the backend.
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

## ADR-12. Per-feature i18n files and per-feature mock service files

- **Decision:** page-specific strings go in per-feature locale files (`src/i18n/locales/{en,vi,ja}/pages/<feature>.ts`, matching keys); shared strings go in `common.ts` (only add keys, never modify existing ones). Each feature owns its own mock service file (e.g. an applications/candidates feature file built on top of `teamApplicationsService`).
- **Why:** parallel work without merge conflicts in one big file.
- **Rejected:** one shared RBAC locale file; one monolithic mock file.

## ADR-13. Only FE Integration edits the menu config

- **Decision:** `RecruiterLayout` navigation items are changed only by the FE Integration owner.
- **Why:** the sidebar is a merge-conflict hotspot and depends on every feature being ready.
- **Rejected:** each feature PR adding its own menu entry.
