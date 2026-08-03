# Nexhire Project Rules

These rules are mandatory for all work in the Nexhire frontend project.

inclusion: always

---

## 1. Project Stack

- Use React, TypeScript, Vite, and Tailwind CSS.
- Use Axios through the shared client only: `src/lib/api/axios.customize.ts`.
- Keep implementation aligned with the existing page-first structure.
- Do not introduce a new framework, state library, UI kit, or routing style unless the user approves it first.

---

## 2. Page-First Structure

- Do not create a top-level `src/components` folder.
- Every page must live in its own folder under `src/pages`.
- Page folders use PascalCase with the `Page` suffix.
- Page entry file is always `index.tsx`.
- Page-local components go inside that page folder under `components`.
- Components shared across pages go inside `src/pages/_components`.

Example:

```text
src/pages/LoginPage/index.tsx
src/pages/LoginPage/components/LoginForm.tsx
src/pages/_components/Button.tsx
```

---

## 3. Layout Rules

- Shared layout wrappers must live in `src/layouts`.
- Use layouts for page shells, auth screens, dashboards, and other wrappers shared by more than one page.
- Do not place layout components inside a page folder unless the layout is truly private to that one page.

---

## 4. Component Rules

- One component per file.
- Component files use PascalCase.
- Component name must match the file name.
- Keep page components small and focused.
- Do not mix unrelated components in the same file.
- Prefer composition over large conditional JSX blocks.
- Put reusable UI primitives in `src/pages/_components`.

---

## 5. i18n Rules

Nexhire must support:

- English: `en`
- Vietnamese: `vi`
- Japanese: `ja`

Rules:

- Do not hardcode user-facing UI text in JSX.
- Every new UI string must be added to all three languages.
- Each page must have one locale file per language.
- Matching pages must use matching file names in every language folder.
- Shared text such as buttons, validation messages, navigation labels, and common statuses belongs in `common.ts`.
- Page-specific text belongs in that page locale file.

Required pattern:

```text
src/i18n/locales/en/pages/login.ts
src/i18n/locales/vi/pages/login.ts
src/i18n/locales/ja/pages/login.ts
```

If a page adds `login.ts` in `vi`, it must also add `login.ts` in `en` and `ja`.

Preferred key shape:

```ts
export const login = {
  title: 'Welcome back',
  subtitle: 'Sign in to continue with NexHire',
  form: {
    emailLabel: 'Email',
    passwordLabel: 'Password',
  },
}
```

---

## 6. Theme Rules

The initial Nexhire theme follows the reference login image:

- Light app background.
- White surfaces.
- Dark neutral text.
- Soft gray borders.
- Primary brand gradient from pink to orange.

Core design tokens:

```text
brand.start: #f23b94
brand.end:   #ff6a21
brand.solid: #f25555
background:  #f7f6fb
surface:     #ffffff
text.primary:#111827
text.muted:  #6b7280
border:      #d9d9e3
```

Rules:

- Do not hardcode one-off colors in JSX.
- Prefer theme tokens or CSS variables for all colors.
- Do not use random Tailwind color families such as `blue-500`, `purple-600`, or `emerald-700` for core UI.
- Buttons, links, active states, and logo accents should use the pink-to-orange brand direction.
- Cards and auth panels should use white surfaces, soft borders, and subtle shadow.
- Keep border radius moderate: usually `8px` or less, unless the design requires a larger auth card radius.
- All UI work must be responsive across mobile, tablet, laptop, and desktop viewports.
- New or changed screens must define responsive layout behavior for small, medium, and large breakpoints before implementation.
- Wide desktop is a first-class breakpoint. New or changed public/user-facing screens must define how layout scales at `>= 1440px` and must be verified at `1920px` width, equivalent to common 24-inch monitors. When feasible, also verify at `2560px`.
- Do not leave grid, table, search, or detail pages capped at narrow laptop widths such as `~72rem` when the content can safely use more horizontal space. Use fluid max-width tokens, adaptive grids, and component-level caps so text lines, logos, cards, and media do not become oversized.
- Avoid fixed widths/heights that break on small screens; use responsive constraints such as min/max widths, fluid grids, wrapping, and container-safe spacing.
- Text, buttons, forms, cards, navigation, and media must not overflow, overlap, or become unusable on narrow screens.
- After UI changes, verify responsive behavior on mobile and desktop layouts at minimum. If browser preview is unavailable, report that visual responsive verification could not be performed.

---

## 7. API Rules

- All HTTP requests must use `apiClient` from `src/lib/api`.
- Do not call `axios` directly inside pages or components.
- Do not create multiple Axios instances unless there is a clear reason and the user approves it.
- API functions belong in `src/services`.
- Define request and response types before using API responses in UI.
- Store API base URL in `VITE_API_BASE_URL`.

Example:

```ts
import { apiClient } from '../lib/api'

export const authService = {
  login: (payload: LoginPayload) => apiClient.post<LoginResponse>('/auth/login', payload),
}
```

---

## 8. Naming Rules

| Type | Convention | Example |
| --- | --- | --- |
| Page folder | PascalCase + Page | `LoginPage` |
| Page entry | `index.tsx` | `src/pages/LoginPage/index.tsx` |
| Component file | PascalCase | `LoginForm.tsx` |
| Hook file | camelCase with `use` prefix | `useLoginForm.ts` |
| Service file | camelCase with `.service` suffix | `auth.service.ts` |
| Type file | camelCase with `.types` suffix | `auth.types.ts` |
| Route path | kebab-case | `/forgot-password` |
| Locale page file | camelCase or kebab-case matching route | `forgotPassword.ts` |

---

## 9. Routing Rules

- Keep route declarations in `src/app/routes.tsx`.
- New pages must be registered there.
- Route paths use kebab-case.
- Page names should stay clear and business-oriented.
- Do not duplicate page components for each language. Duplicate only locale text files.

---

## 10. Workflow Rules

- Read existing files before editing.
- Keep edits scoped to the task.
- Do not rewrite unrelated files.
- Do not remove user changes.
- Follow the Git workflow in `.agent/rule/git-workflow.md`.
- Do not work, commit, or push directly on `main`; use `develop` as the primary working branch.
- If the user asks to preview first, show the intended file changes before applying.
- After code changes, run:

```bash
npm run build
npm run lint
```

- If a command cannot run, report the reason clearly.
- When completing an approved large feature, automatically create a scoped Git commit after build and lint pass, unless the user explicitly says not to commit.
- Large features include new pages, multi-file UI flows, new routed experiences, API/service integrations, or broad shared UI changes.
- Do not auto-commit small fixes, exploratory changes, documentation-only edits, or partial work unless the user asks.

## 11. Approval-First Implementation Rule

- Before implementing any code, config, UI, API, refactor, or rule change, always present a detailed implementation plan first.
- The plan must include the goal, affected files, intended behavior changes, implementation steps, and verification steps.
- Show the intended code changes, config changes, or rule changes as code snippets or a proposed diff before applying them.
- For large changes, show the most important code snippets plus a file-by-file change summary.
- Wait for explicit user approval before editing files or triển khai implementation.
- After approval, implement only the approved scope.
- If the implementation needs to change from the approved plan or proposed code, stop and show the updated plan and updated code/diff for approval first.
