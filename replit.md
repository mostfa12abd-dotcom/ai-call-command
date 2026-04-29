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

- `artifacts/voxa` — Voxa AI call center dashboard (React + Vite + Tailwind v3 + shadcn). Ported from a Lovable.dev project. Auth and data are currently a local mock backed by an in-memory store (`artifacts/voxa/src/lib/supabase.ts` + `src/data/mockData.ts`) so the original Supabase call sites in `contexts/AuthContext.tsx`, `hooks/useDashboardData.ts`, `hooks/useCustomersData.ts`, and `pages/CustomerDetail.tsx` keep working unchanged. Any email/password signs in. Routes: `/login`, `/dashboard`, `/customers`, `/customers/:id`, `/settings`. Mounted at `/`.
- `artifacts/api-server` — shared Express API scaffold (currently only `/api/healthz`).
- `artifacts/mockup-sandbox` — design/mockup sandbox.
