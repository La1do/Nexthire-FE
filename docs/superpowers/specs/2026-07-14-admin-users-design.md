# Admin Users Page — Design

**Date:** 2026-07-14
**Route:** `/admin/users`
**Layout:** `AdminLayout` (new)
**Scope:** Single page (admin product UI). No auth guard yet — layout-only. Mock data inline. No new dependencies.

## Goals

- Quản trị viên scan nhanh + thao tác ít nhầm.
- Desktop primary, responsive xuống tablet/mobile (table → card list).
- Performance: LCP p75 < 2500ms, INP < 200ms, CLS < 0.1; bundle delta < 80KB gzip/route.
- Lighthouse a11y + perf ≥ 90.
- i18n đầy đủ vi / en / ja, đồng bộ pattern hiện có.

## Non-Goals

- Auth guard / role-based redirect (phase sau khi có auth store).
- Tích hợp API thật (dùng mock data nội bộ).
- Thêm thư viện icon / table / pagination (inline SVG + pure logic).
- Trang admin khác (Dashboard, Settings, v.v.) — chỉ dựng skeleton sidebar với các mục trỏ về `/` placeholder.

## Approach

**Approach A — 2 DOM, CSS toggle (desktop table + mobile card list).**

Single page renders both, hides one with media query at `<900px`. Justification: giữ semantic `<table>` cho AT ở desktop, không thêm JS matchMedia, không re-render khi đổi viewport.

Trade-off: render 2 DOM cho cùng dữ liệu. Acceptable: list ≈ 8-20 rows, không ảnh hưởng paint. Pagination giữ layout ổn định.

## Architecture

### Route registry

`src/app/routes.tsx` thêm entry:

```ts
{
  path: '/admin/users',
  label: pages.adminUsers.routeLabel,
  element: <AdminUsersPage />,
  layout: AdminLayout,
}
```

### Layout: `src/layouts/AdminLayout.tsx`

Shell:

- Desktop: `grid-cols-[260px_1fr]`. Sidebar trái + main bên phải.
- Mobile (<900px): 1 cột. Sidebar collapse → drawer top, mở bằng nút hamburger trên topbar. Khi mở, sidebar hiển thị full-width dưới topbar.

Thành phần:

- **AdminSidebar**: brand mark + nav links (`Dashboard`, `Users`, `Jobs`, `Settings`; `Users` active khi trên `/admin/users`) + current-user card ở đáy (avatar chữ cái + tên + email + role label).
- **AdminTopbar**: hamburger (chỉ mobile) + page title (lấy từ `pages.adminUsers.pageTitle`) + search global placeholder + icon bell + icon profile. Bell/profile là button có `aria-label`.
- **`<main>` slot**: page content.

Props: nhận `currentTitleKey?: string` để cho phép các trang admin khác override title ở topbar (mặc định lấy từ content). Ở phase này, AdminUsersPage không cần override.

Accessibility:

- Sidebar dùng `<aside>` với `aria-label="Admin navigation"`.
- Hamburger button có `aria-expanded`, `aria-controls="admin-sidebar"`.
- Drawer tự quản `inert`/`aria-hidden` khi đóng.

State: `useState('isSidebarOpen')` chỉ dùng cho mobile drawer. ESC đóng drawer. Click outside đóng (chỉ trên mobile).

### Page: `src/pages/AdminUsersPage/index.tsx`

State:

```ts
const [query, setQuery] = useState('')
const [role, setRole] = useState<AdminUserRole | 'all'>('all')
const [status, setStatus] = useState<AdminUserStatus | 'all'>('all')
const [page, setPage] = useState(1)

const PAGE_SIZE = 8

const filtered = useMemo(
  () => filterAdminUsers(adminUsersFixture, { query, role, status }),
  [query, role, status],
)
const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
```

Render order: `PageHeader` → `StatsRow` (4× `AdminStatCard`) → `AdminUserFilters` → `AdminUserTable` (desktop) + `AdminUserMobileList` (mobile, cùng data `paged`) → `AdminPagination`. Nếu `filtered.length === 0`, render empty state thay vì table/list.

Reset `page` về 1 mỗi khi `query | role | status` đổi (effect đơn giản).

### Components (one job per file)

Tất cả nằm trong `src/pages/AdminUsersPage/components/`:

- **`AdminStatCard`** — props `{ label, value, delta?, tone, icon }`. Tone: `'blue' | 'coral' | 'violet' | 'amber'`. Icon là React node (inline SVG). Hiển thị label nhỏ, số lớn, badge delta, icon nền nhạt tone-tương-ứng.
- **`AdminUserFilters`** — props `{ query, role, status, onQueryChange, onRoleChange, onStatusChange, onClear, hasActiveFilters, content }`. Render: input search có icon + label ẩn visually, 2 select (role + status) với option "Tất cả", nút "Xóa lọc" chỉ hiện khi `hasActiveFilters`.
- **`AdminUserTable`** — props `{ users, content, tone, onLock, onUnlock, onDelete, onView }`. Semantic `<table>` với `<caption className="sr-only">` mô tả nội dung, columns: User (avatar + name + email), Role (badge), Status (badge), Created, Last active, Actions (3 icon-buttons). Ẩn bằng class `admin-users-table-wrap` (CSS ẩn ở `<900px`).
- **`AdminUserMobileList`** — props giống `AdminUserTable` trừ không cần `tone`. `<ul>` các card: avatar | name + email + meta | actions stack vertical. Hiện class `admin-users-mobile-list` (CSS ẩn ở `≥900px`).
- **`AdminPagination`** — props `{ page, totalPages, onPageChange, labels }`. Render prev button + range 1-2-3 + ellipsis thông minh + next button. Ẩn khi `totalPages <= 1`. Active page có `aria-current="page"`.
- **`AdminUserBadge`** — props `{ tone, children }`. Pill nhỏ với tone variant (`'admin' | 'employer' | 'candidate'` cho role; `'active' | 'locked' | 'invited'` cho status).

### Data + utils (page-local, không export global)

- **`src/pages/AdminUsersPage/types.ts`** — type định nghĩa.
- **`src/pages/AdminUsersPage/utils/adminUsersData.ts`** — `adminUsersFixture: AdminUser[]` (~20 items cố định) + `computeAdminStats(users)` → `{ total, candidates, employers, locked }`. Delta cố định theo data (placeholder, không tính toán động).
- **`src/pages/AdminUsersPage/utils/adminUsersFilters.ts`** — pure functions: `filterAdminUsers(users, criteria)`, `isActiveFilters(criteria)`, `normalizeQuery(value)`.

#### Types

```ts
export type AdminUserRole = 'admin' | 'employer' | 'candidate'
export type AdminUserStatus = 'active' | 'locked' | 'invited'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  createdAt: string // ISO date
  lastActiveAt: string // ISO date
  company?: string
}

export type AdminUserCriteria = {
  query: string
  role: AdminUserRole | 'all'
  status: AdminUserStatus | 'all'
}

export type AdminUserStats = {
  total: number
  candidates: number
  employers: number
  locked: number
}
```

## Responsive CSS

Thêm vào cuối `src/styles/index.css`, mọi class dùng `--*` biến có sẵn trong `:root` (không hard-code màu trong component).

Các key breakpoints:

- `≥1100px`: stats 4 cột, sidebar full.
- `≥900px`: sidebar 260px, table hiện, mobile list ẩn, stats 4 cột.
- `600–899px`: stats 2 cột, sidebar collapse, mobile list hiện.
- `<600px`: stats 1 cột, filters 1 cột.

Skeleton:

```css
.admin-shell { min-height: 100dvh; display: grid; grid-template-columns: 260px 1fr; }
.admin-sidebar { /* fixed in shell */ }
.admin-main { display: flex; flex-direction: column; min-width: 0; }

.admin-users-page { display: grid; gap: 1.25rem; padding: clamp(1rem, 3vw, 1.75rem); max-width: 1200px; width: 100%; margin-inline: auto; }
.admin-users-stats { display: grid; gap: 1rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.admin-users-filters { display: grid; gap: 0.75rem; grid-template-columns: 1fr 220px 220px auto; align-items: end; }

@media (max-width: 1100px) {
  .admin-users-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .admin-shell { grid-template-columns: 1fr; }
  .admin-sidebar { display: none; }
  .admin-sidebar.is-open { display: flex; }
  .admin-users-filters { grid-template-columns: 1fr; align-items: stretch; }
  .admin-users-table-wrap { display: none; }
  .admin-users-mobile-list { display: grid; }
}
.admin-users-mobile-list { display: none; gap: 0.75rem; }
@media (max-width: 520px) {
  .admin-users-stats { grid-template-columns: 1fr; }
}
```

Dark/contrast: mọi color dùng biến `--color-*` đã có. Thêm 2 biến nếu cần: `--color-admin-sidebar-bg`, `--color-admin-stat-amber-bg`.

## i18n

### Type additions trong `src/i18n/types.ts`

```ts
export type AdminUsersTranslations = {
  routeLabel: string
  pageTitle: string
  pageSubtitle: string
  sidebar: {
    dashboard: string
    users: string
    jobs: string
    settings: string
    logout: string
  }
  topbar: {
    searchPlaceholder: string
    notificationsLabel: string
    toggleSidebarLabel: string
    profileLabel: string
  }
  stats: {
    totalLabel: string
    candidatesLabel: string
    employersLabel: string
    lockedLabel: string
    totalDelta: string
    candidatesDelta: string
    employersDelta: string
    lockedDelta: string
  }
  filters: {
    queryLabel: string
    queryPlaceholder: string
    roleLabel: string
    statusLabel: string
    roleAll: string
    statusAll: string
    clear: string
  }
  results: {
    caption: string
    countLabel: string
    emptyTitle: string
    emptyDescription: string
    columns: {
      user: string
      role: string
      status: string
      createdAt: string
      lastActiveAt: string
      actions: string
    }
    actionView: string
    actionLock: string
    actionUnlock: string
    actionDelete: string
  }
  pagination: {
    prev: string
    next: string
    pageLabel: string
    pageOf: string // interpolation: "{{current}} / {{total}}"
  }
  roles: {
    admin: string
    employer: string
    candidate: string
  }
  statuses: {
    active: string
    locked: string
    invited: string
  }
  currentUser: {
    name: string
    email: string
    role: string
  }
}
```

Thêm `adminUsers: AdminUsersTranslations` vào `Translations.pages`.

### Locales

3 file mới (mỗi file ~50 dòng):

- `src/i18n/locales/vi/pages/adminUsers.ts`
- `src/i18n/locales/en/pages/adminUsers.ts`
- `src/i18n/locales/ja/pages/adminUsers.ts`

Đăng ký trong `src/i18n/index.ts` (thêm 3 import + 3 entry vào `pages` map của từng locale, pattern giống `search`).

## File Changes

1. `src/layouts/AdminLayout.tsx` (new)
2. `src/pages/AdminUsersPage/index.tsx` (new)
3. `src/pages/AdminUsersPage/types.ts` (new)
4. `src/pages/AdminUsersPage/utils/adminUsersData.ts` (new)
5. `src/pages/AdminUsersPage/utils/adminUsersFilters.ts` (new)
6. `src/pages/AdminUsersPage/components/AdminStatCard.tsx` (new)
7. `src/pages/AdminUsersPage/components/AdminUserFilters.tsx` (new)
8. `src/pages/AdminUsersPage/components/AdminUserTable.tsx` (new)
9. `src/pages/AdminUsersPage/components/AdminUserMobileList.tsx` (new)
10. `src/pages/AdminUsersPage/components/AdminPagination.tsx` (new)
11. `src/pages/AdminUsersPage/components/AdminUserBadge.tsx` (new)
12. `src/app/routes.tsx` (add entry)
13. `src/i18n/types.ts` (add `AdminUsersTranslations` + extend `Translations.pages`)
14. `src/i18n/index.ts` (import + register 3 locales)
15. `src/i18n/locales/vi/pages/adminUsers.ts` (new)
16. `src/i18n/locales/en/pages/adminUsers.ts` (new)
17. `src/i18n/locales/ja/pages/adminUsers.ts` (new)
18. `src/styles/index.css` (append admin CSS block)

## Performance

- No new dependency. Bundle delta ≈ 10-15 KB gzip cho route này (thoả `<80KB`).
- LCP: layout là text/HTML + CSS thuần. Không fetch hình/third-party. Dễ đạt `<2500ms` ở desktop.
- INP: state mutation chỉ re-render subtree, không có heavy compute.
- CLS: stats/pagination giữ khung cố định (`min-height` cho card), table/list không reflow khi data swap vì cùng `gap` grid.

## Accessibility

- Table có `<caption>` (visually hidden) mô tả nội dung.
- Filter inputs có `<label>` (visually hidden khi cần) + `aria-describedby` cho helper text.
- Icon-buttons có `aria-label` đầy đủ + `title` (tooltip hover).
- Hamburger button có `aria-expanded` + `aria-controls="admin-sidebar"`. Drawer đóng thì `aria-hidden="true"`.
- Pagination active page có `aria-current="page"`. Prev/next disable khi đầu/cuối.
- Keyboard: ESC đóng drawer; focus-visible ring theo `--color-brand-solid`.
- Color contrast ≥ 4.5:1 cho text body, dùng biến `--color-text-*` đã có.

## Verification

1. `pnpm run build` → `tsc -b && vite build` pass.
2. `pnpm run lint` (oxlint) pass.
3. Manual trên dev server (`pnpm run dev`):
   - Truy cập `/admin/users` trên desktop: sidebar full, 4 stats cards, table với ~20 users, phân trang 3 trang.
   - Resize xuống <900px: sidebar collapse, mobile list hiện thay table.
   - Filter theo role `candidate` + status `locked` → list rút gọn đúng.
   - Nút "Xóa lọc" chỉ xuất hiện khi có filter active.
   - Empty state hiện khi filter không match user nào.
   - Pagination chuyển trang đúng, button prev/next disable ở đầu/cuối.
   - Hamburger trên mobile mở/đóng drawer, focus trở về button khi ESC.
4. Lighthouse desktop `/admin/users`: a11y + perf ≥ 90.
5. Bundle analyzer: route `/admin/users` delta < 80KB gzip.

## Risks & Open Questions

- **Auth guard**: scope đã loại trừ. Phase sau nếu cần gate, sẽ tích hợp với auth store chưa tồn tại trong repo.
- **Sidebar link đến Dashboard/Jobs/Settings**: hiện `/`-placeholder, không tạo route mới trong phase này.
- **i18n pageOf interpolation**: cần helper format `{{current}} / {{total}}` tại runtime (replaceAll trước render). KHÔNG dùng lib template.
- **Anti-YAGNI**: lock/unlock/delete handlers chỉ stub (`onClick={() => alert(...)}`) — phase này tập trung UI/UX, sau nối API. Phase này vẫn render icon-buttons thật để verify a11y.

## Out of Scope (explicit)

- Tạo các trang admin khác (Dashboard, Job moderation, v.v.).
- Real-time update (WebSocket / SSE).
- Bulk actions (select many users + act).
- Audit log / activity feed.
- Permissions / role-based UI filtering.

## Acceptance Criteria

- [ ] `/admin/users` render được ở vi/en/ja, không có key thiếu.
- [ ] Sidebar có 4 mục, "Users" active đúng trên route này.
- [ ] 4 stats card hiển thị số đúng từ fixture.
- [ ] Filter search theo name + email hoạt động (case-insensitive, normalized).
- [ ] Filter role + status hoạt động.
- [ ] Desktop ≥900px dùng table, mobile <900px dùng card list, CSS toggle không bị flash.
- [ ] Pagination giới hạn 8 item/trang, prev/next đúng.
- [ ] Empty state hiện khi `filtered.length === 0`.
- [ ] Mobile drawer mở/đóng bằng nút + ESC + click outside.
- [ ] `pnpm run build` và `pnpm run lint` đều pass.
- [ ] Lighthouse a11y ≥ 90, perf ≥ 90 trên desktop.
