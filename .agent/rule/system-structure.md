# Nexhire System Structure

This file defines the folder structure that the project must follow.

inclusion: always

---

## 1. Current Root Structure

```text
Nexhire/
  public/
  src/
  .env.example
  .gitignore
  .oxlintrc.json
  index.html
  package.json
  package-lock.json
  README.md
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```

---

## 2. Technology Stack

Project frontend uses these libraries:

- **React Router v6** — quản lý điều hướng phía client.
- **Zustand** — quản lý state toàn cục nhẹ và đơn giản.
- **React Query (TanStack Query)** — cache và đồng bộ dữ liệu từ API.
- **React Hook Form + Zod** — quản lý form và validate dữ liệu.
- **Tailwind CSS** — styling utility-first.
- **Recharts** — hiển thị biểu đồ cho trang AI score và admin dashboard.

Rules:

- Cài đặt qua pnpm/npm tương ứng với package manager đang dùng.
- Không tự ý thêm thư viện ngoài stack này mà không được user phê duyệt trước.
- Khi thêm package mới vào stack, cập nhật lại mục này.

---

## 3. Required Source Structure

```text
src/
  app/
    App.tsx
    routes.tsx

  layouts/
    MainLayout.tsx
    AuthLayout.tsx

  pages/
    _components/
      Button.tsx
      EmptyState.tsx
      Input.tsx
      Loading.tsx
      index.ts

    HomePage/
      index.tsx
      components/

    LoginPage/
      index.tsx
      components/

  i18n/
    index.ts
    types.ts
    locales/
      en/
        common.ts
        pages/
          home.ts
          login.ts
      vi/
        common.ts
        pages/
          home.ts
          login.ts
      ja/
        common.ts
        pages/
          home.ts
          login.ts

  theme/
    index.ts
    tokens.ts

  lib/
    api/
      axios.customize.ts
      index.ts
    utils/

  services/
    auth.service.ts
    user.service.ts

  hooks/
  constants/
  assets/
  styles/
    index.css
  types/
```

Note: folders that do not have implementation yet may keep `.gitkeep` files.

---

## 4. Page Folder Contract

Each page must follow this structure:

```text
src/pages/<PageName>Page/
  index.tsx
  components/
    <PageLocalComponent>.tsx
```

Allowed optional folders for larger pages:

```text
src/pages/<PageName>Page/
  hooks/
  types/
  utils/
```

Rules:

- `index.tsx` exports the page component.
- Page-local components stay inside `components`.
- Do not place API calls directly in page components.
- Do not place translation objects inside page folders.

---

## 5. i18n Structure Contract

Every supported language gets its own folder:

```text
src/i18n/locales/en/
src/i18n/locales/vi/
src/i18n/locales/ja/
```

Shared text:

```text
src/i18n/locales/en/common.ts
src/i18n/locales/vi/common.ts
src/i18n/locales/ja/common.ts
```

Page text:

```text
src/i18n/locales/en/pages/<page>.ts
src/i18n/locales/vi/pages/<page>.ts
src/i18n/locales/ja/pages/<page>.ts
```

Example for login:

```text
src/i18n/locales/en/pages/login.ts
src/i18n/locales/vi/pages/login.ts
src/i18n/locales/ja/pages/login.ts
```

All language folders must have the same page locale files.

---

## 6. Theme Structure Contract

Theme tokens should live in:

```text
src/theme/tokens.ts
```

Theme exports should live in:

```text
src/theme/index.ts
```

Initial token groups:

```text
brand
background
surface
text
border
shadow
radius
spacing
```

Initial brand palette:

```text
brand.start: #f23b94
brand.end:   #ff6a21
brand.solid: #f25555
```

Initial neutral palette:

```text
background.app: #f7f6fb
surface.card:   #ffffff
text.primary:   #111827
text.secondary: #374151
text.muted:     #6b7280
border.default: #d9d9e3
```

Use these tokens for login, auth, dashboard, forms, and shared UI.

---

## 7. API And Services Structure

Axios client:

```text
src/lib/api/axios.customize.ts
src/lib/api/index.ts
```

Service modules:

```text
src/services/auth.service.ts
src/services/user.service.ts
src/services/job.service.ts
src/services/company.service.ts
```

Rules:

- Components import service functions, not raw Axios.
- Services import `apiClient` from `src/lib/api`.
- Shared API types can live beside service files or in `src/types`.
- Do not put business API logic in `src/lib/api`; keep it in `src/services`.

---

## 8. Auth UI Structure Example

Login page:

```text
src/pages/LoginPage/
  index.tsx
  components/
    LoginForm.tsx
    PasswordField.tsx
```

Login locales:

```text
src/i18n/locales/en/pages/login.ts
src/i18n/locales/vi/pages/login.ts
src/i18n/locales/ja/pages/login.ts
```

Auth layout:

```text
src/layouts/AuthLayout.tsx
```

Auth service:

```text
src/services/auth.service.ts
```

---

## 9. Import Direction

Allowed direction:

```text
pages -> layouts
pages -> pages/_components
pages -> hooks
pages -> services
services -> lib/api
components -> hooks
components -> i18n
components -> theme
```

Avoid:

```text
services -> pages
lib -> pages
layouts -> pages
pages/_components -> page-specific components
```

This keeps reusable code independent from page-specific code.

---

## 10. Files To Avoid

Do not add:

```text
src/components/
src/page/
src/library/
src/context/
```

Use the project folders instead:

```text
src/pages/_components/
src/pages/
src/lib/
src/hooks/
```

