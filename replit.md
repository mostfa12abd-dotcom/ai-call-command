# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/voxa` — Voxa AI call center dashboard (React + Vite + Tailwind v3 + shadcn). Ported from a Lovable.dev project. **Auth and data are wired to the real Supabase project** via `@supabase/supabase-js` — see `artifacts/voxa/src/lib/supabase.ts`. Required env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The hooks (`useDashboardData`, `useCustomersData`) and `pages/CustomerDetail.tsx` query the `calls`, `customers`, `tenant_settings`, `tenant_columns`, and `tenant_custom_actions` tables filtered by `tenant_id = auth.uid()`. Built-in i18n layer (English/Arabic) lives in `src/i18n/translations.ts` with the `useLanguage()` hook providing `t()`. Routes: `/login`, `/dashboard`, `/customers`, `/customers/:id`, `/settings`. Mounted at `/`.
- `artifacts/api-server` — shared Express API scaffold (currently only `/api/healthz`).
- `artifacts/mockup-sandbox` — design/mockup sandbox.
