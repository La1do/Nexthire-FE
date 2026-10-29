# Nexhire Typography Standardization Rules

This rule defines the mandatory guidelines and execution plan for unifying the typography system across all portals (Candidate, Recruiter, Admin) in the Nexhire frontend project using **Option 1 (Unified Inter System)**.

inclusion: always

---

## 1. Core Principles & Objectives

- **One Single Font System:** Use **`Inter`** as the sole primary typeface across the entire application (Headings, Body, Buttons, Forms, Tables, Badges, Modals, Drawers).
- **Zero Platform & Portal Inconsistency:** Eliminate the split between public landing pages and private workspaces (Candidate, Recruiter, Admin). All portals must share the exact same typography stack.
- **100% Self-Hosted Assets:** Do not rely on external Google Fonts or CDN links. All font binaries (`.woff2`) must reside in `public/fonts/` with proper Vietnamese diacritic subsets.
- **Zero Synthetic Bolding (Eliminate `font-weight: 850 / 950`):** Standardize all font weights to valid CSS numerical weights (`400`, `500`, `600`, `700`, `800`, `900`). Never use arbitrary weights like `850` or `950` that cause synthetic bolding distortion on Vietnamese diacritics.
- **Safe Monospace Fallback:** Use a clean, standard system monospace stack for technical IDs, tokens, policy logs, and audit revisions in Admin and Recruiter views.

---

## 2. Font Stack & Token Definition

### 2.1 CSS Variables

Define the primary typography variables in `src/styles/tokens.css` (or `src/styles/typography.css`):

```css
:root {
  /* Primary Sans-serif stack */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Display / Heading stack (Unified with Inter) */
  --font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Monospace stack for technical data, hashes, IDs */
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

  /* Backward Compatibility Mappings (Do not break existing page styles) */
  --font-home-body: var(--font-sans);
  --font-home-display: var(--font-display);
}
```

### 2.2 Standard Font Weights

Only the following weights are permitted:

| Weight | Name | Primary Use Cases |
| :--- | :--- | :--- |
| `400` | Regular | Body text, descriptions, general paragraph content |
| `500` | Medium | Form labels, table cells, secondary buttons, navigation links |
| `600` | SemiBold | Subheadings, card titles, table headers, primary buttons, badges |
| `700` | Bold | Section titles (H2, H3), key metrics, drawer headers |
| `800` | ExtraBold | Main page titles (H1), Hero display headers, Brand mark label |

**Rule on Legacy Weights:**
- Any existing rule with `font-weight: 850` MUST be mapped to `font-weight: 700` (or `font-weight: 800` if it is a major title).
- Any existing rule with `font-weight: 950` MUST be mapped to `font-weight: 800` or `font-weight: 900`.

---

## 3. Font Asset Setup (`public/fonts/`)

### 3.1 Required Font Files
The following self-hosted files must be placed in `public/fonts/`:
1. `Inter-VariableFont.woff2` (supports weights 100 to 900, covering Latin & Vietnamese)
   *Or* dedicated static subsets:
   - `Inter-Regular.woff2` (weight 400)
   - `Inter-Medium.woff2` (weight 500)
   - `Inter-SemiBold.woff2` (weight 600)
   - `Inter-Bold.woff2` (weight 700)

### 3.2 `@font-face` Specification
Declare `@font-face` inside `src/styles/tokens.css` with `font-display: swap` and Vietnamese unicode range:

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/Inter-VariableFont.woff2") format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
    U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC,
    U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD,
    U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1,
    U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329,
    U+1EA0-1EF9, U+20AB;
}
```

### 3.3 HTML Preload (`index.html`)
To prevent Flash of Unstyled Text (FOUT) and Cumulative Layout Shift (CLS), preload the primary font in `index.html`:

```html
<link
  rel="preload"
  href="/fonts/Inter-VariableFont.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

---

## 4. Architecture & File Relocation Rules

1. **Move Root `tokens.css` to `src/styles/tokens.css`:**
   - The file `tokens.css` sitting at the root directory (`/tokens.css`) must be moved inside `src/styles/tokens.css`.
2. **Remove Relative Imports in Page CSS:**
   - Remove all relative imports like `@import "../../../tokens.css";` from:
     - `src/pages/HomePage/home.css`
     - `src/pages/CompaniesPage/companies.css`
     - `src/pages/CandidateJobsPage/candidate-jobs.css`
     - `src/pages/CandidateCvsPage/candidate-cvs.css`
     - `src/pages/CandidateSettingsPage/candidate-settings.css`
     - `src/pages/CareerGuidePage/career-guide.css`
     - `src/pages/CareerGuideDetailPage/career-guide-detail.css`
     - `src/pages/CvTemplatesPage/cv-templates.css`
     - `src/pages/RecruiterCompanyPage/recruiter-company.css`
     - `src/pages/RecruiterSettingsPage/recruiter-settings.css`
3. **Single Global Import in `src/styles/index.css`:**
   - `src/styles/index.css` must import `./tokens.css` at line 1.
   - Enforce the global base typography in `src/styles/index.css`:
     ```css
     html,
     body,
     button,
     input,
     select,
     textarea {
       font-family: var(--font-sans);
     }
     ```

---

## 5. Step-by-Step AI Execution Checklist

When tasked with implementing this typography unification, the AI agent must strictly follow these sequential steps:

### Step 1: Font Asset Verification & Placement
- [ ] Check if `Inter-VariableFont.woff2` or static `Inter-*.woff2` exist in `public/fonts/`.
- [ ] If missing, obtain or extract the woff2 font files with Latin + Vietnamese support and place them into `public/fonts/`.
- [ ] Add `<link rel="preload" ...>` to `index.html`.
- [ ] Update inline boot-loader font in `index.html:28` to use `var(--font-sans, Inter, sans-serif)`.

### Step 2: Token Architecture Relocation
- [ ] Relocate `tokens.css` from the project root into `src/styles/tokens.css`.
- [ ] Declare `@font-face` for Inter with Vietnamese unicode ranges.
- [ ] Define `--font-sans`, `--font-display`, and `--font-mono`.
- [ ] Map legacy `--font-home-body` and `--font-home-display` to `var(--font-sans)` to ensure zero breaking changes.
- [ ] Import `./tokens.css` at the top of `src/styles/index.css`.
- [ ] Remove all 10 legacy relative imports (`@import "../../../tokens.css";`) across `src/pages/**/*.css`.

### Step 3: Global Font-Weight Audit & Replacement
- [ ] Search all CSS files for `font-weight: 850` and `font-weight: 950` using regex `font-weight:\s*(850|950)`.
- [ ] Replace `850` with `700` (or `800` for primary page headers).
- [ ] Replace `950` with `800` (or `900` for brand marks).
- [ ] Check inline styles and component files for any remaining hardcoded `850` or `950`.

### Step 4: Portal & Component Verification
- [ ] **Candidate Portal:** Verify [HomePage], [SearchPage], [JobDetailPage], [ProfilePage], [CandidateJobsPage].
- [ ] **Recruiter Portal:** Verify [RecruiterHomePage], [RecruiterJobsPage], [RecruiterApplicationsPage], [RecruiterJobCreatePage].
- [ ] **Admin Portal:** Verify [AdminDashboardPage], [AdminJobsPage], [AdminUsersPage], [AdminCompaniesPage].
- [ ] **CV Builder:** Verify [CvBuilderPage] and test that PDF / image exports (`html2canvas`, `jspdf`) render text cleanly without missing glyphs.
- [ ] **Vietnamese Diacritics:** Verify that stacked diacritics (e.g., `ệ`, `ở`, `ữ`, `ễ`, `ấ`) render crisply at small sizes (12px-14px) and large display sizes (24px-48px).

### Step 5: Build & Lint Validation
- [ ] Run `npm run lint` (or `oxlint`) to ensure no CSS syntax or file resolution errors.
- [ ] Run `npm run build` (`tsc -b && vite build`) to guarantee clean production compilation without asset resolution warnings.

---

## 6. Strict Rules for AI Agents

- **DO NOT** introduce Google Fonts external CDN links (`fonts.googleapis.com`). All fonts must remain self-hosted.
- **DO NOT** introduce random ad-hoc font families in new components. Always use `var(--font-sans)` or `var(--font-mono)`.
- **DO NOT** add layout or feature CSS rules to `src/styles/index.css` when cleaning up (adhere strictly to [AGENTS.md CSS ownership](../../AGENTS.md)).
- When referencing files in PRs, reviews, or commits, always use markdown link format: `[filename.ts](path/to/filename.ts)`.
