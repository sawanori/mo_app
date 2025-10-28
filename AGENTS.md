# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router (pages, layouts, `app/api/*` routes).
- `components/`: UI components; primitives in `components/ui/`; extracted views like `hero-card.tsx`, `menu-grid.tsx`, `nav-button.tsx`, `subcategory-header.tsx`.
- `hooks/`: custom hooks (e.g., `use-sticky-sidebar`, `use-subcategory-scroll`).
- `lib/`: shared utilities and Zustand stores (`lib/store/*`); Prisma client in `lib/prisma.ts`.
- `prisma/`: `schema.prisma` and `migrations/`.
- `tests/`: Playwright specs; some `*.spec.ts` sit at repo root; artifacts in `test-results/`.
- `scripts/`: one-off scripts (e.g., `scripts/migrate-data.ts`).

## Build, Test, and Development Commands
- `npm run dev` — start dev server at `http://localhost:3000`.
- `npm run build` — production build; `npm run start` — serve built app.
- `npm run lint` — ESLint (Next core web vitals rules).
- `npx prisma generate` — regenerate Prisma client after schema changes.
- `npx prisma migrate dev` — create/apply local migrations.
- `npx tsx scripts/migrate-data.ts` — seed sample data.
- `npx playwright test` — run E2E tests (ensure dev server is running).

## Coding Style & Naming Conventions
- TypeScript (strict); 2‑space indentation.
- Filenames: kebab-case (e.g., `menu-section.tsx`). Components: PascalCase. Variables/functions: camelCase.
- Use path alias `@/*` from `tsconfig.json` for imports.
- Keep UI class names/structure stable; prefer extraction + memoization over rewrites.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`); tests match `**/*.spec.ts` in `tests/` and repo root.
- Start the app first (`npm run dev`), then run tests. Artifacts (traces/screenshots) are written to `test-results/`.
- Prefer `data-testid` selectors (already added to key UI parts).
- Example: `npx playwright test tests/theme-test.spec.ts`.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits, e.g.:
  - `feat(app): add menu filtering`
  - `fix(api): correct category update`
- PRs include: clear description, linked issues, test plan/steps, and screenshots for UI changes. Keep diffs focused; update tests/types/docs when behavior changes.

## Security & Configuration Tips
- Do not commit secrets; use `.env`/`.env*.local` only (see `.env.example`). Keep `DATABASE_URL` local.
- After `prisma/schema.prisma` changes, run `npx prisma generate` and migrate.
- Do not put secrets in `NEXT_PUBLIC_*` env vars.
- Next/Image remote hosts are restricted in `next.config.js` (e.g., `images.unsplash.com`). Add domains as needed.
