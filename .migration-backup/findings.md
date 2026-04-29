# Project Findings & Research: Voxa

## Known Constraints
- **Supabase Auth:** When manually inserting users via SQL for testing, the `confirmation_token`, `recovery_token`, and `email_change_token_new` must be set to empty strings (`''`) rather than `NULL` to avoid `Scan error` during login.
- **Data Shape:** The `CallDetailDrawer` expects `total_conversation` as a single raw text string. Earlier mock data used an array of objects for transcripts, which caused UI rendering failures until patched.
- **Email Rate Limits:** Creating multiple test accounts quickly triggers Supabase email rate limits unless "Confirm email" is disabled in Auth settings.

## Core Discoveries
- **Multi-Tenant Isolation:** Row Level Security (RLS) is fully active and functioning natively based on `auth.uid() = tenant_id`. It perfectly isolates customers and calls.
- **Dynamic Configuration:** We are utilizing Postgres `JSONB` columns (`features` in `tenant_settings` and `custom_data` in `calls`) to avoid endless schema migrations. This allows a restaurant client to store `order_id` and a clinic client to store `appointment_date` in the exact same table without conflict.

## System Architecture Discoveries
- **The Voice AI Pipeline (Planned):** VAPI handles the actual voice synthesis and AI logic. When a call ends, VAPI sends a JSON payload to a webhook. We will use `n8n` to catch this webhook, parse the JSON, summarize it, and push it directly into our Supabase Postgres database.
