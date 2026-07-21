# Recruiter UI ATS-Style Redesign — Design Spec

**Date:** 2026-07-21
**Status:** Approved (pending written-spec review)
**Branch:** `develop`

---

## Goal

Refactor toàn bộ Recruiter area (shell + 3 trang) sang phong cách ATS (Greenhouse/Lever),
nâng chất lượng từ ~6-7/10 lên **8.5-9/10**, đồng thời giảm CSS debt kỹ thuật để dễ maintain.

**Scope:**
- Recruiter Shell (sidebar + topbar)
- Recruiter Jobs Dashboard (KPI + filter + job cards)
- Recruiter Job Create Workspace (form + preview sidebar)
- Recruiter Job Detail (hero + overview + content + moderation)
- CSS cleanup (~395 dòng dead + orphan selectors)
- i18n updates cho `en`, `vi`, `ja`

**Out of scope:**
- Candidate-side JobDetailPage (không refactor)
- Backend API changes
- Auth/login flows

---

## Quality Targets

| Page | Before | Target |
|---|---|---|
| Recruiter Dashboard | 6/10 | 9/10 |
| Post Job | 6/10 | 8.5-9/10 |
| Job Detail | 7/10 | 8.5/10 |
| CSS maintainability | poor | substantially improved |

---

## Phase 1 — Recruiter Shell

### Files
- `src/layouts/RecruiterLayout.tsx` (194 lines — small surgical edits)
- `src/styles/index.css` (block 7077-7316: ~239 lines of shell CSS)

### Decisions
1. **Sidebar active state**: giữ logic hiện tại (array-mapped, `/recruiter` exact match, others `startsWith`). Polish visual: thêm icon + label alignment chuẩn với `.recruiter-sidebar__nav a` selector (không thêm base BEM class, giữ pattern parent selector).
2. **Icon + label alignment**: dùng flex, `gap: 0.75rem`, `align-items: center`, `min-height: 2.75rem`.
3. **Glass topbar**: thêm `backdrop-filter: saturate(180%) blur(12px)` đã có token `--motion-ease-standard`. Verify đã có sẵn hay cần thêm.
4. **Compact user card**:
   - Hiện tại: `<img>` hoặc `<span>initials</span>` + `<strong>name</strong>` + `<small>role/company</small>`.
   - Polish: tighter padding, avatar 36x36, name → 14px/600, sub → 12px/400 muted.
5. **Notification button**: polish pill shape, ring khi hover, position relative cho badge dot nếu có.
6. **Mobile drawer** (bổ sung quan trọng):
   - Add media query `@media (max-width: 900px)`:
     - `.recruiter-shell` → `grid-template-columns: 1fr` (sidebar ẩn)
     - `.recruiter-sidebar` → `position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); z-index: 60; transition: transform 220ms var(--motion-ease-out);`
     - `.recruiter-sidebar.is-open` → `transform: translateX(0);`
     - `.recruiter-topbar__toggle` → `display: inline-flex` ở mobile (currently `display: none` mặc định)
   - Pattern copy từ Admin (lines 6987-7024) — đã confirmed OK.

### Validation
- Desktop ≥1024px: sidebar visible, toggle hidden
- 901-1023px: desktop look (sidebar vẫn visible)
- ≤900px: sidebar ẩn, toggle visible, drawer works với Escape + outside click

---

## Phase 2 — Recruiter Jobs Dashboard

### Files
- `src/pages/RecruiterJobsPage/index.tsx` (488 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobList.tsx` (146 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobFilters.tsx` (60 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobStatusBadge.tsx` (15 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobStatusTabs.tsx` (46 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobActions.tsx` (80 lines)
- `src/pages/RecruiterJobsPage/components/RecruiterJobSummary.tsx` (61 lines — mới)
- `src/styles/index.css` (block 9068-10060)

### Decisions

#### KPI Cards (`.recruiter-job-summary`)
4 cards hiện đã có (Total / Needs Action / Published / Inactive). Polish:
- **Hover state**: `transform: translateY(-2px); box-shadow: var(--shadow-brand);` transition 160ms.
- **Analytics style**: thêm subtle gradient background tint cho mỗi tone (total → brand-soft, action → warning-soft, published → home-accent-soft, inactive → surface-muted). Dùng tokens có sẵn.
- **Trend indicator**: hiển thị delta (placeholder "+X tuần này" hoặc icon trending). Có thể làm optional — nếu data chưa có trend, hiển thị icon mũi tên trung tính.
- **Action badge**: card "Needs Action" thêm badge "!" nếu count > 0 (red dot hoặc ring).

#### Filter Toolbar (`.recruiter-jobs-panel` hoặc wrap mới)
- **Sticky**: `position: sticky; top: var(--topbar-height, 64px); z-index: 20; background: var(--color-surface-card);`
- **Search nổi bật**: pill input với icon prefix, larger `min-height: 2.75rem`, focus ring `--color-brand-solid`.
- **Status chips gọn hơn**: badge-style chips thay vì full tabs row. (NOTE: RecruiterJobStatusTabs đang là full-width tabs row — nếu dùng chip-style cần refactor component, tùy dependent. *Decision: giữ tabs structure, polish chip styling trên tabs.*)
- **Sort compact**: thu gọn select, thêm icon sort indicator trước label.

#### Job Cards (`.recruiter-job-row-card`)
Hierarchy mới (đã có structure, polish):
- **Title ưu tiên 1**: `font-size: 1.125rem; font-weight: 600; line-height: 1.3;`
- **Meta row**: thu nhỏ, `font-size: 0.8125rem; color: var(--color-text-muted);`
- **Application count nổi bật**: large number `font-size: 1.5rem; font-weight: 700;` + "candidates" suffix muted.
- **Deadline warning**: nếu deadline trong 7 ngày → icon ⚠ + warning-soft bg. Quá hạn → danger.
- **Status badge** (`.recruiter-job-status`): giữ tones, polish padding + ring.
- **Arrow hint khi hover**: thêm `→` icon ở góc phải, opacity 0 → 1 on `:hover`.
- **Quick actions** bên phải: giữ `.recruiter-job-actions` cluster, đảm bảo icon buttons.

#### Polish CSS đang thiếu
Nhiều class đang dùng trong JSX nhưng chưa có selector explicit (`.recruiter-job-filters`, `.recruiter-job-filter-select`, `.recruiter-job-status-tabs`, `.recruiter-job-row-card`, `.recruiter-job-actions`, `.recruiter-job-action`, `.recruiter-job-edit-link`). Nhiều khả năng styled bởi Scope B overrides. Phase 2 sẽ verify + ensure styling đầy đủ.

---

## Phase 3 — Job Create Workspace

### Files
- `src/pages/RecruiterJobCreatePage/index.tsx` (432 lines)
- `src/pages/RecruiterJobCreatePage/components/JobPostForm.tsx` (429 lines)
- `src/pages/RecruiterJobCreatePage/components/JobPostPreview.tsx` (259 lines)
- `src/pages/RecruiterJobCreatePage/components/JobPostReviewDialog.tsx` (128 lines)
- `src/pages/RecruiterJobCreatePage/components/JobPostCompanyGate.tsx` (80 lines)
- `src/styles/index.css` (block 8128-9952 — form/preview/save-state/readiness/checklist/dialog)

### Decisions

#### Form Structure (đã có 3 sections)
Đổi title cho khớp plan user:
- Section 1: "Core information" → **"Job Basics"** (i18n key: `form.sections.basics.title` = "Job basics")
- Section 2: "Salary, skills, and deadline" → **"Hiring Details"** (i18n key: `form.sections.details.title` = "Hiring details")
- Section 3: "Hiring brief" → **"Job Content"** (i18n key: `form.sections.content.title` = "Job content")

(Optional — confirm với user trước khi đổi label hay giữ label hiện tại. Hiện tại labels đã semantic + không quá xấu, có thể SKIP đổi và polish visual thôi.)

#### Section header rõ hơn
Hiện dùng `.recruiter-panel__header`. Polish:
- **Eyebrow** (chip nhỏ): "Step 1" / "Step 2" / "Step 3"
- **Title**: 18px/600
- **Description**: 14px muted, max 2 lines
- **Border-bottom** subtle ngăn sections

#### Field spacing đồng nhất
- Standardize `gap: 1rem` giữa fields, `1.5rem` giữa section rows.
- Sử dụng `--space-*` tokens nếu có, nếu không dùng literal rem.

#### Preview sidebar (Sticky hoàn chỉnh)
Hiện **chưa sticky** — critical bug cần fix:
- `.recruiter-preview` → add `position: sticky; top: 88px; max-height: calc(100vh - 96px); overflow-y: auto;`
- Top offset 88px = topbar height (64px) + 24px breathing room.

#### Save state card (`.job-post-save-state`)
Đã có. Polish:
- Visual emphasis cho từng state: `is-saving` → spinner + brand-soft, `is-unsaved`/`is-dirty` → warning-soft, `is-saved` → home-accent-soft.
- Border-left màu theo state (4px).

#### Readiness card (`.job-post-readiness`)
Đã có (`<strong>{percent}%</strong>` + bar + footer).
Polish:
- Bar gradient `--color-brand-start → --color-brand-end`.
- Percent font-size 28px, font-weight 700.
- Count `{done}/{total} items complete` ở footer.

#### Checklist (`.job-post-checklist`)
Đã có 5 rows. Polish:
- Row hover subtle background.
- Icon checkmark/muted dot alignment.
- Currently TODO → filled green dot.
- Border-left cho row chưa done (warning accent).

#### Action bar (`.job-post-form-actions`)
Đã đủ 3 buttons: Save Draft / Submit Review / Reset.
Polish ưu tiên:
- **Save Draft**: secondary variant, left
- **Submit Review**: primary variant (gradient brand), right, larger `padding: 0.875rem 1.5rem;`
- **Reset**: ghost variant, danger-on-hover (hiện không có — cân nhắc)
- Dùng `gap: 0.75rem`, `justify-content: space-between` (Save Draft + Reset cluster left, Submit Review right).

---

## Phase 4 — Job Detail (Recruiter View Only)

### Files
- `src/pages/RecruiterJobsPage/index.tsx` (chứa `RecruiterJobDetailPage`)
- `src/styles/index.css` (block ~9459-9577 hiện đã có detail structure)

### Decisions

#### Hero (`.recruiter-job-detail-header`)
Đã có với:
- Title + status badge
- Hero metrics: Status / Applications / Deadline / Updated (`.recruiter-job-detail-hero-metrics`)
- Actions (`.recruiter-job-detail-header__actions`)

Polish:
- Eyebrow (recruiter role + job ID)
- Title font-size 32px/700
- 4 metrics grid: label small uppercase + value big

#### Main content (`.recruiter-job-detail-grid`)
3 panels hiện có:
- `.recruiter-job-detail-panel--overview`: job facts dl
- `.recruiter-job-detail-panel--content`: description + requirements + benefits + skills
- `.recruiter-job-detail-panel--moderation`: ở cuối

#### Info sidebar
Overview panel đã chứa info dl (`salary, location, workingType, employmentType, experienceLevel, openings, deadline, publishedAt, updatedAt`).
Polish:
- Style như "info card" với bg `--color-surface-muted`.
- Salary nổi bật (font lớn + currency).

#### Moderation (`.recruiter-job-detail-panel--moderation`)
Đã ở cuối. Add:
- **Collapse/expand**: native `<details>` hoặc state hook. Mặc định collapse nếu không có moderation, expand nếu `hasModeration`.
- **Admin notes**: hiển thị `adminReason`, `unpublishReason` với label `.recruiter-job-detail-notes`.
- **Audit data**: jobId, version, createdAt, updatedAt — có sẵn trong overview.

---

## Phase 5 — CSS Cleanup

### Cleanup targets (verified)

#### Xóa block 9210-9605 (~395 lines dead)
- `.recruiter-jobs-table-shell` (initial def + responsive override)
- `.recruiter-jobs-table`, `th`, `td`, `tbody tr:last-child`
- `.recruiter-jobs-row`, `:hover, :focus-visible`
- `.recruiter-job-title-cell`, `a/span/small`
- `.recruiter-job-status` + 7 tone variants (9290-9332)
- `.recruiter-job-actions`, `.recruiter-job-action`, `.recruiter-job-edit-link`, `--delete/--close` variants, `--actions-empty`
- `.recruiter-jobs-cards` (initial def 9372 — không xóa responsive 9602 vì cũng dead, xóa cả)
- `.recruiter-job-card-row` + `__header` + `dl/dt/dd` + states
- `.recruiter-jobs-pagination` + `button` + `disabled` + `span`
- Media query 9585-9605 (.recruiter-jobs-table-shell {display:none}, .recruiter-jobs-cards {display:grid})
- Media query 9608-9639 (touch `.recruiter-job-card-row`)

#### Xóa orphan 7581-7602
- `.recruiter-dashboard-state` + descendants (không có JSX reference)

#### JobCreate duplicates (verify trước khi xóa)
CSS explore cho thấy Scope A (8128-8719) và Scope B (9819-9952) duplicate nhiều selectors.
**Decision: KHÔNG xóa Scope B duplicates** (theo user chọn "Giữ nguyên, verify scope").
Phase 5 chỉ xóa rõ ràng dead.

### CSS organization (after cleanup)
Giữ file `index.css` đơn, tổ chức lại comments phân nhóm rõ:
```
/* ---------- RECRUITER SHELL ---------- */
/* ---------- RECRUITER JOBS DASHBOARD ---------- */
/* ---------- RECRUITER JOBS DETAIL ---------- */
/* ---------- RECRUITER JOB CREATE WORKSPACE ---------- */
```

---

## Phase 6 — Validation

### Commands
```bash
npm run lint
npm run build
```

### Manual test matrix
| Route | Mobile (<640px) | Tablet (641-1024px) | Desktop (>1024px) |
|---|---|---|---|
| `/recruiter` | ✓ | ✓ | ✓ |
| `/recruiter/jobs` | ✓ (drawer) | ✓ (drawer) | ✓ |
| `/recruiter/jobs/new` | ✓ | ✓ | ✓ |
| `/recruiter/jobs/:id` | ✓ | ✓ | ✓ |

Verify trên Chrome devtools với responsive modes.
Check:
- Sidebar drawer toggle works on mobile
- Sticky elements stay pinned during scroll
- Forms remain usable on small viewports
- Job cards hierarchy readable on mobile

### Expected outcome
- Lint: 0 errors (oxlint config đã strict)
- Build: TypeScript compile pass
- 4 routes × 3 breakpoints = 12 viewports pass manual

---

## Phase 7 — i18n Updates

### Files (6 files)
- `src/i18n/locales/en/pages/recruiterJobCreate.ts`
- `src/i18n/locales/vi/pages/recruiterJobCreate.ts`
- `src/i18n/locales/ja/pages/recruiterJobCreate.ts`
- `src/i18n/locales/en/pages/recruiterJobs.ts`
- `src/i18n/locales/vi/pages/recruiterJobs.ts`
- `src/i18n/locales/ja/pages/recruiterJobs.ts`

### Keys cần thêm/cập nhật

#### recruiterJobCreate
- Rename section labels: `form.sections.basics/details/content` → confirm wording
- Step indicators: `form.steps.basics/details/content` (new)
- New: priority actions: `form.actions.primaryHint` nếu cần

#### recruiterJobs
- Hero eyebrow polish (`hero.eyebrow`)
- KPI labels đã có sẵn — verify đủ
- Add: `summary.totalTrend`, `summary.actionBadge` (optional)
- Add: `card.deadlineWarning` (due soon / overdue)

### Translation approach
- EN: viết trực tiếp
- VI: dịch tự nhiên, không dịch word-by-word
- JA: ngắn gọn, respectful (敬語 vừa phải cho UI)

---

## Risks & Open Questions

1. **Scope B "UX refresh" trong CSS**: chưa verify wrapper selector (parent là `.recruiter-dashboard`?). Nếu verify fail (không có parent wrap), tức là pure duplicate → cần consolidate. Phase 5 sẽ confirm.
2. **Topbar height token**: cần đo topbar thực tế để pick top offset chính xác cho sticky elements.
3. **Deadline warning rule**: "trong 7 ngày" có thể quá strict — chờ UI smoke test.

## Out of Scope (Explicit)

- JobDetailPage candidate-side
- Apply page UI
- Admin pages
- Auth pages
- Profile pages
