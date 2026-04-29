# AI Call Center Project - Voxa

## Project Overview
This is an AI-powered call center platform built with React, TypeScript, and Vite. It uses Supabase as the backend database and authentication provider, and integrates with VAPI for voice AI capabilities.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, React Router
- **UI**: ShadCN UI components, Tailwind CSS, Lucide icons
- **State Management**: React Query for data fetching, Context API for auth
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Voice AI**: VAPI for voice synthesis and AI logic
- **Workflow Automation**: n8n for webhook processing (planned)
- **Testing**: Vitest
- **Linting**: ESLint

## MCP Tools Available

### Supabase MCP Server
Connected to project `woqufuhlntwfohbpjnru` with full database access:
- `supabase_list_tables`: List database tables
- `supabase_execute_sql`: Execute raw SQL queries
- `supabase_list_extensions`: List database extensions
- `supabase_list_migrations`: List database migrations
- `supabase_apply_migration`: Apply a migration
- `supabase_get_logs`: Get service logs
- `supabase_get_advisors`: Get security/performance advisories
- `supabase_get_project_url`: Get project API URL
- `supabase_get_publishable_keys`: Get publishable API keys
- `supabase_generate_typescript_types`: Generate TypeScript types
- `supabase_list_edge_functions`: List Edge Functions
- `supabase_get_edge_function`: Get Edge Function contents
- `supabase_deploy_edge_function`: Deploy an Edge Function
- `supabase_create_branch`: Create a development branch
- `supabase_list_branches`: List development branches
- `supabase_delete_branch`: Delete a development branch
- `supabase_merge_branch`: Merge branch to production
- `supabase_reset_branch`: Reset branch migrations
- `supabase_rebase_branch`: Rebase branch on production

### VAPI MCP Server
Connected to VAPI account with access to:
- `vapi_list_assistants`: List all Vapi assistants
- `vapi_get_assistant`: Get a Vapi assistant by ID
- `vapi_create_assistant`: Create a new Vapi assistant
- `vapi_update_assistant`: Update an existing Vapi assistant
- `vapi_delete_assistant`: Delete an assistant
- `vapi_list_calls`: List all Vapi calls
- `vapi_get_call`: Get details of a specific call
- `vapi_create_call`: Create an outbound call (immediate or scheduled)
- `vapi_list_phone_numbers`: List all Vapi phone numbers
- `vapi_get_phone_number`: Get details of a specific phone number
- `vapi_list_tools`: List all available Vapi tools
- `vapi_get_tool`: Get details of a specific Vapi tool
- `vapi_login`: Start OAuth flow
- `vapi_logout`: Log out and clear credentials

## Project Structure
- `/src`: Main application code
  - `/components`: Reusable UI components
  - `/pages`: Application pages (Dashboard, Customers, CustomerDetail, Settings, Login)
  - `/hooks`: Custom React hooks (useDashboardData, useCustomersData)
  - `/contexts`: React contexts (AuthContext)
  - `/lib`: Utility functions and Supabase client
  - `/data`: Mock data and configuration
- `/public`: Static assets
- `/tools`: Additional tools and utilities
- `/architecture`: Architecture documents
- Configuration files: `.env`, `package.json`, `vite.config.ts`, `tailwind.config.ts`, etc.

## Database Schema
### Calls Table (`public.calls`)
- `id` (uuid): Primary key
- `tenant_id` (uuid): Foreign key to tenant_settings
- `caller_name` (text): Caller's name
- `company` (text): Caller's company
- `call_duration` (integer): Duration in seconds
- `status` (text): Call status (pickup, missed, etc.)
- `satisfaction` (text): Satisfaction level (High, Medium, Low, None)
- `two_word_summary` (text): Brief summary
- `total_conversation` (text): Full conversation transcript
- `detailed_summary` (text): Detailed AI-generated summary
- `custom_data` (jsonb): Flexible custom data storage
- `created_at` (timestamp): Call timestamp

### Tenant Settings Table (`public.tenant_settings`)
- Tenant-specific configuration and features

### Customers Table (`public.customers`)
- Customer information aggregated from calls

## Key Features
1. **Multi-tenancy**: Row Level Security (RLS) ensures data isolation between tenants
2. **Dynamic Configuration**: JSONB columns (`features` in `tenant_settings`, `custom_data` in `calls`) allow flexible schema without migrations
3. **Voice AI Pipeline**: Planned integration with VAPI → n8n webhook → Supabase for call processing
4. **Real-time Dashboard**: Shows KPIs and recent calls with filtering and search
5. **Customer Management**: View and manage customer profiles and call history

## Available Commands in OpenCode
To use the MCP tools in this project:
- **Supabase**: `use the supabase tool to [action]` (e.g., "use the supabase tool to list tables")
- **VAPI**: `use the vapi tool to [action]` (e.g., "use the vapi tool to list assistants")

## Notes
- The Supabase connection uses your provided token: `sbp_00856f27eb481a04c42401e3f5d7d31176c782d1`
- The VAPI connection uses your API key from `.env`: `819d90c7-5855-47d5-b3f7-564371208f76`
- Both MCP connections are active and ready for use