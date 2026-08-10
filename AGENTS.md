# Nexthire-FE Rules

## CSS Ownership

- Keep `src/styles/index.css` for global reset, tokens, base elements, and shared primitives only.
- Put layout-level styles next to the layout file. Example: `src/layouts/MainLayout.tsx` imports `src/layouts/main-layout.css`.
- Put page-level styles next to the page owner, using `src/pages/<PageName>/<page-name>.css`, and import it from that page entry.
- Put component-only styles next to the component when the class is not shared across pages.
- Do not add feature, page, or layout selectors to `src/styles/index.css` just to fix a visual bug. Move the selector to the owning CSS file first.
- When restoring CSS after a rebase or conflict, search the selector owner with `rg` before pasting rules back into global CSS.
- Keep responsive rules and keyframes in the same CSS file as the selectors they affect.

## Local Commands

- Prefix shell commands with `/home/truongdb/.local/bin/rtk`.
