-- ============================================================
-- Voxa — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── tenant_settings ────────────────────────────────────────────
-- One row per authenticated user. id = auth.users.id
create table if not exists public.tenant_settings (
  id              uuid primary key references auth.users(id) on delete cascade,
  vapi_assistant_id text,
  feature_flags   jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);

alter table public.tenant_settings enable row level security;

create policy "Tenants see own settings" on public.tenant_settings
  for all using (auth.uid() = id);

-- ── calls ──────────────────────────────────────────────────────
create table if not exists public.calls (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid references auth.users(id) on delete cascade,
  vapi_id             text,
  caller_name         text not null default 'Unknown',
  customer_number     text,
  ended_reason        text,
  company             text default '—',
  call_duration       integer default 0,   -- seconds
  status              text default 'Pickup', -- 'Pickup' | 'Missed'
  satisfaction        text,                -- 'High' | 'Medium' | 'Low'
  two_word_summary    text,
  total_conversation  text,
  detailed_summary    text,
  custom_data         jsonb default '{}'::jsonb,
  recording_url       text,
  created_at          timestamptz default now()
);

alter table public.calls enable row level security;

-- Tenants can only see calls they own (tenant_id = their auth UID).
-- Vapi / n8n webhooks must insert with tenant_id = the user's auth.uid().
-- Do NOT use vapi_assistant_id as a secondary tenant_id in RLS — users
-- control that field and it would allow cross-tenant data exposure.
create policy "Tenants see own calls" on public.calls
  for all using (auth.uid() = tenant_id);

create index if not exists calls_tenant_id_idx on public.calls (tenant_id);
create index if not exists calls_created_at_idx on public.calls (created_at desc);
create index if not exists calls_vapi_id_idx on public.calls (vapi_id);

-- ── customers ──────────────────────────────────────────────────
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid references auth.users(id) on delete cascade,
  name              text not null,
  phone             text,
  company           text,
  email             text,
  followup_status   text,
  call_completed    boolean,
  created_at        timestamptz default now()
);

alter table public.customers enable row level security;

create policy "Tenants see own customers" on public.customers
  for all using (auth.uid() = tenant_id);

create index if not exists customers_tenant_id_idx on public.customers (tenant_id);

-- ── tenant_columns ─────────────────────────────────────────────
-- Controls which columns appear in the dashboard call table.
create table if not exists public.tenant_columns (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references auth.users(id) on delete cascade,
  column_key  text not null,
  label       text not null,
  data_path   text not null,  -- e.g. "caller_name" or "custom_data.cost"
  visible     boolean default true,
  position    integer default 0
);

alter table public.tenant_columns enable row level security;

create policy "Tenants see own columns" on public.tenant_columns
  for all using (auth.uid() = tenant_id);

-- ── tenant_custom_actions ──────────────────────────────────────
create table if not exists public.tenant_custom_actions (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid references auth.users(id) on delete cascade,
  action_id      text not null,
  label          text not null,
  webhook_url    text not null,
  page_location  text default 'dashboard',
  icon           text,
  color_class    text
);

alter table public.tenant_custom_actions enable row level security;

create policy "Tenants see own actions" on public.tenant_custom_actions
  for all using (auth.uid() = tenant_id);

-- ── n8n_chat_histories ─────────────────────────────────────────
-- WhatsApp / n8n message history shown in CustomerDetail.
-- tenant_id is NOT NULL — every row must be scoped to a tenant.
create table if not exists public.n8n_chat_histories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references auth.users(id) on delete cascade,
  session_id  text not null,  -- customer phone number used as session key
  message     jsonb not null, -- { type: 'ai'|'human', content: string }
  created_at  timestamptz default now()
);

-- Enforce NOT NULL on existing tables (CREATE IF NOT EXISTS skips column changes).
alter table public.n8n_chat_histories
  alter column tenant_id set not null;

alter table public.n8n_chat_histories enable row level security;

create policy "Tenants see own chat histories" on public.n8n_chat_histories
  for all using (auth.uid() = tenant_id);

create index if not exists n8n_chat_histories_tenant_session_idx
  on public.n8n_chat_histories (tenant_id, session_id);

-- ── Auto-create tenant_settings on first sign-in ───────────────
-- Triggered whenever a new user is inserted into auth.users
-- (Google OAuth, email sign-up, etc.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.tenant_settings (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop the trigger first so this script is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- After running this schema:
-- 1. Go to Authentication → Providers → Enable Google
-- 2. Add your Google OAuth Client ID & Secret
-- 3. Add your Replit dev URL to the allowed redirect URLs:
--    https://<your-repl-slug>.<username>.replit.dev/auth/callback
-- ============================================================
