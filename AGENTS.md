# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router (pages, layouts, `app/api/*` routes).
- `components/`: UI components; primitives in `components/ui/`.
- `lib/`: shared utilities, state (`lib/store/`), Prisma client (`lib/prisma.ts`).
- `hooks/`: reusable React hooks.
- `prisma/`: Prisma schema and migrations.
- `tests/`: Playwright specs; additional `*.spec.ts` files may live at repo root.
- `scripts/`: one-off maintenance scripts (e.g., data migration).

## Build, Test, and Development Commands
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run build`: production build.
- `npm run start`: start built app.
- `npm run lint`: run ESLint (Next core web vitals).
- `npx prisma generate`: generate Prisma client after schema changes.
- `npx prisma migrate dev`: create/apply DB migrations to the local Postgres.
- `npx tsx scripts/migrate-data.ts`: load sample data into the DB.
- `npx playwright test`: run UI/integration tests (dev server must be running).

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). Indentation: 2 spaces.
- File names: kebab-case (e.g., `menu-section.tsx`).
- Components: PascalCase names, React function components.
- Variables/functions: camelCase. Enforce with `npm run lint` before PRs.
- Paths: prefer alias `@/*` (configured in `tsconfig.json`).

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Tests match `**/*.spec.ts`.
- Start the app first: `npm run dev`, then run tests in a new terminal.
- Artifacts: failing runs store traces/screenshots in `test-results/`.
- Aim to cover critical user flows (no hard coverage threshold yet).
- Example: `npx playwright test tests/video-menu-test.spec.ts`.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits (history has no strict convention yet):
  - Example: `feat(app): add menu filtering` or `fix(api): correct status code`.
- PRs should include: clear description, linked issues, test plan/steps, and screenshots for UI changes.
- Keep diffs focused; update tests, types, and docs when behavior changes.

## Security & Configuration Tips
- Configure `.env` (e.g., `DATABASE_URL=postgresql://...`). Do not commit secrets.
- After changing `prisma/schema.prisma`, run `npx prisma generate` and migrate.
