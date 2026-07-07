# Voxa — AI Call Center Dashboard

A React + Vite + Supabase frontend dashboard for an AI-powered call center. Features a login page, dashboard with call metrics, customer management, and settings.

## Stack

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v3, shadcn/ui (Radix UI primitives)
- **Auth & DB:** Supabase (`@supabase/supabase-js`)
- **Routing:** React Router DOM v7 + Wouter
- **Charts:** Recharts
- **State:** TanStack Query
- **Animations:** Framer Motion
- **i18n:** Custom translations in `src/i18n/translations.ts`

## Running the app

```bash
PORT=5000 pnpm run dev
```

The workflow "Start application" runs this automatically.

## Environment

Secrets required (set as Replit Secrets):
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

## Project structure

```
src/
  components/   — UI components (shadcn/ui + custom)
  contexts/     — AuthContext, LanguageContext
  data/         — Mock data (mockData.ts)
  hooks/        — Custom hooks (dashboard data, customers, etc.)
  i18n/         — Translation strings
  lib/          — supabase.ts client, utils
  pages/        — Login, Dashboard, Customers, CustomerDetail, Settings
```

## Setting up your Supabase database

Run `supabase/schema.sql` in your Supabase project → **SQL Editor → New query** to create all required tables:
- `calls` — call records with tenant-scoped RLS
- `customers` — customer records
- `tenant_settings` — per-user config (vapi_assistant_id, feature_flags)
- `tenant_columns` — custom dashboard columns
- `tenant_custom_actions` — webhook action buttons
- `n8n_chat_histories` — WhatsApp/n8n message history (tenant-scoped)

Until real data exists the dashboard shows generated mock data automatically.

## Enabling Google sign-in

1. In your Supabase project go to **Authentication → Providers → Google** and enable it
2. Add your Google OAuth **Client ID** and **Client Secret** (from Google Cloud Console)
3. Add your Replit app URL to the allowed redirect URLs in both Supabase and Google Cloud:
   `https://<your-repl-domain>/dashboard`
4. That's it — the "Continue with Google" button is fully wired

## Notes

- Imported from a monorepo zip; workspace and catalog references were resolved for standalone Replit use.
- `src/lib/supabase.ts` auto-prefixes `https://` if the URL secret is missing the protocol.
- Google OAuth: `signInWithOAuth` redirects to `window.location.origin/dashboard`; Supabase `detectSessionInUrl: true` handles the callback automatically.

## User preferences

- Prefers keeping the existing project structure and stack.
