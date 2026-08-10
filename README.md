# Nexhire FE

Frontend scaffold for Nexhire, built with React, TypeScript, Vite, and Tailwind CSS.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Source Structure

```text
src/
  app/                 App shell and route registry
  layouts/             Layout wrappers shared by pages
  pages/
    _components/       Components shared across pages
    HomePage/          One page per folder
  assets/              Static source assets
  constants/           Shared constants
  hooks/               Shared hooks
  lib/                 API clients and utilities
  services/            Business/service modules
  styles/              Global styles and Tailwind entry
  types/               Shared TypeScript types
```

## API Client

The shared Axios client lives at `src/lib/api/axios.customize.ts`.
Import it from `src/lib/api` when creating service modules.

Remote repository: https://github.com/La1do/Nexthire-FE.git
