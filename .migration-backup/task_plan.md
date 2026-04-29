# B.L.A.S.T. Task Plan: Voxa (AI Call Center Agency)

## Phase 1: Blueprint
- [x] Initial React dashboard setup with Vite & Tailwind CSS.
- [x] Define core database architecture (Multi-tenant schema via Supabase).
- [ ] Define the strict JSON Data Schema (`gemini.md`) for incoming webhooks from VAPI/n8n.
- [ ] Finalize Discovery: Determine exactly how AI prompts are managed per tenant.

## Phase 2: Link
- [x] Supabase Authentication linked & verified (Auth context, Login/Signup routes).
- [x] Supabase Database linked with Row Level Security (RLS) enforcing `tenant_id` isolation.
- [ ] Connect VAPI to an exposed webhook URL.
- [ ] Connect n8n to Supabase via Postgres node or Supabase API to inject calls into the database.

## Phase 3: Architect
- [ ] Create `architecture/call_ingestion_sop.md`: Document how an ended call flows from VAPI -> n8n -> Supabase.
- [ ] Create `architecture/tenant_provisioning_sop.md`: Document how a new SaaS customer gets their own AI phone number and config.

## Phase 4: Stylize
- [x] Basic Dashboard styling with Tailwind, dynamic KPIs, and Lucide icons.
- [x] Refine Call Detail Drawer to handle long text `total_conversation`.
- [ ] Build the "Super Admin" dashboard to toggle `tenant_settings.features` (JSONB) dynamically.
- [ ] Stylize a "Settings" page for tenants to inject their own business data (instructions, business hours) into the AI.

## Phase 5: Trigger
- [ ] Configure n8n webhooks to listen permanently.
- [ ] Deploy the React frontend to Vercel/Netlify.
- [ ] Test end-to-end: Call a real VAPI number -> AI talks -> Call ends -> Dashboard updates in real-time.
